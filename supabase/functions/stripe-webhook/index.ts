import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Use service role key to bypass RLS - NO AUTH REQUIRED for webhooks
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No stripe signature found");
    }

    logStep("Verifying webhook signature");

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Webhook verified", { eventType: event.type, eventId: event.id });

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Handling checkout.session.completed", {
          sessionId: session.id,
        });

        if (session.mode === "subscription") {
          await handleSubscriptionCreated(session, stripe, supabaseClient);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep(`Handling ${event.type}`, { subscriptionId: subscription.id });
        await handleSubscriptionUpdate(subscription, stripe, supabaseClient);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Handling subscription deletion", {
          subscriptionId: subscription.id,
        });
        await handleSubscriptionDeleted(subscription, stripe, supabaseClient);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          logStep("Handling successful payment", {
            subscriptionId: invoice.subscription,
          });
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );
          await handleSubscriptionUpdate(subscription, stripe, supabaseClient);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          logStep("Handling failed payment", {
            subscriptionId: invoice.subscription,
          });
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );
          await handleSubscriptionUpdate(subscription, stripe, supabaseClient);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionCreated(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabaseClient: any,
) {
  try {
    logStep("Processing subscription creation from checkout");

    if (!session.customer || !session.subscription) {
      logStep("Missing customer or subscription in session");
      return;
    }

    const customer = await stripe.customers.retrieve(
      session.customer as string,
    );
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    if ("deleted" in customer || !customer.email) {
      logStep("Customer not found or no email");
      return;
    }

    await updateUserSubscription(
      customer.email,
      customer.id,
      subscription,
      supabaseClient,
    );
  } catch (error) {
    logStep("Error handling subscription creation", { error: error.message });
  }
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  stripe: Stripe,
  supabaseClient: any,
) {
  try {
    logStep("Processing subscription update", {
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    const customer = await stripe.customers.retrieve(
      subscription.customer as string,
    );

    if ("deleted" in customer || !customer.email) {
      logStep("Customer not found or no email");
      return;
    }

    await updateUserSubscription(
      customer.email,
      customer.id,
      subscription,
      supabaseClient,
    );
  } catch (error) {
    logStep("Error handling subscription update", { error: error.message });
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  stripe: Stripe,
  supabaseClient: any,
) {
  try {
    logStep("Processing subscription deletion");

    const customer = await stripe.customers.retrieve(
      subscription.customer as string,
    );

    if ("deleted" in customer || !customer.email) {
      logStep("Customer not found or no email");
      return;
    }

    // Set user back to free tier immediately when subscription is deleted
    const { error } = await supabaseClient
      .from("profiles")
      .update({
        stripe_customer_id: customer.id,
        stripe_subscription_id: null,
        user_tier: "free",
        subscription_status: "inactive",
        subscription_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", customer.email);

    if (error) {
      logStep("Error updating profile for deleted subscription", { error });
    } else {
      logStep("Successfully updated profile for deleted subscription", {
        email: customer.email,
      });
    }
  } catch (error) {
    logStep("Error handling subscription deletion", { error: error.message });
  }
}

async function updateUserSubscription(
  email: string,
  customerId: string,
  subscription: Stripe.Subscription,
  supabaseClient: any,
) {
  try {
    logStep("Updating user subscription in database", {
      email,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    // Determine subscription tier from price ID
    let subscriptionTier = "free";
    let priceId = "";

    if (subscription.items.data.length > 0) {
      priceId = subscription.items.data[0].price.id;
      logStep("Processing price ID", { priceId });

      // Map price IDs to subscription tiers
      if (
        priceId === "price_1RX2JoQNAWy31QLb2GqkbTmu" || // Premium monthly
        priceId === "price_1RX2K2QNAWy31QLb2IrffIoS"    // Premium yearly
      ) {
        subscriptionTier = "premium";
      } else if (
        priceId === "price_1RX2FjQNAWy31QLb6i2qw3zb" || // University monthly
        priceId === "price_1RX2HmQNAWy31QLbz0cY0LoR"    // University yearly
      ) {
        subscriptionTier = "university";
      }
      logStep("Determined subscription tier", { priceId, subscriptionTier });
    }

    // FIXED: Proper timestamp handling
    let subscriptionEnd: string | null = null;
    try {
      if (subscription.current_period_end) {
        // Convert Unix timestamp to JavaScript Date, then to ISO string
        const endDate = new Date(subscription.current_period_end * 1000);
        subscriptionEnd = endDate.toISOString();
        logStep("Converted subscription end date", { 
          unixTimestamp: subscription.current_period_end,
          isoString: subscriptionEnd 
        });
      }
    } catch (dateError) {
      logStep("Error converting subscription end date", { 
        error: dateError.message,
        timestamp: subscription.current_period_end 
      });
      subscriptionEnd = null;
    }

    const now = new Date();
    const endDate = subscriptionEnd ? new Date(subscriptionEnd) : null;
    const hasExpired = endDate ? now > endDate : false;

    // FIXED: Improved subscription status logic
    let finalTier = subscriptionTier;
    let finalStatus = subscription.status;

    logStep("Analyzing subscription state", {
      stripeStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      hasExpired,
      endDate: subscriptionEnd,
      currentTime: now.toISOString()
    });

    // Handle expired subscriptions
    if (hasExpired) {
      finalTier = "free";
      finalStatus = "inactive";
      subscriptionEnd = null;
      logStep("Subscription has expired, setting to free tier");
    } 
    // Handle active subscriptions
    else if (["active", "trialing"].includes(subscription.status)) {
      if (subscription.cancel_at_period_end) {
        // Active but cancelled - keep tier until end date
        finalStatus = "cancelled";
        logStep("Subscription is active but cancelled at period end");
      } else {
        // Fully active subscription
        finalStatus = "active";
        logStep("Subscription is fully active");
      }
    }
    // Handle non-active subscriptions
    else if (["past_due", "incomplete", "incomplete_expired"].includes(subscription.status)) {
      finalStatus = "past_due";
      // Keep the tier for past_due to allow grace period
      logStep("Subscription is past due, keeping tier with warning status");
    }
    // Handle other statuses (canceled, unpaid, etc.)
    else {
      finalTier = "free";
      finalStatus = "inactive";
      subscriptionEnd = null;
      logStep("Subscription is in non-active state, reverting to free tier");
    }

    logStep("Final subscription state determined", {
      finalTier,
      finalStatus,
      subscriptionEnd
    });

    // Update the user's profile
    const { error } = await supabaseClient
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        user_tier: finalTier,
        subscription_status: finalStatus,
        subscription_end_date: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      logStep("Error updating profile", {
        error,
        email,
      });
      return;
    }

    logStep("Successfully updated subscription data", {
      email,
      tier: finalTier,
      status: finalStatus,
      endDate: subscriptionEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      hasExpired,
    });
  } catch (error) {
    logStep("Error in updateUserSubscription", { error: error.message });
  }
}
