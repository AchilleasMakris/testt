
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Get user email from request body
    const { userEmail } = await req.json();
    if (!userEmail) {
      throw new Error("User email not provided");
    }
    logStep("User email provided", { email: userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found, returning free tier status");

      // Update database to ensure consistency
      await supabaseClient
        .from("profiles")
        .update({
          stripe_customer_id: null,
          stripe_subscription_id: null,
          user_tier: "free",
          subscription_status: "inactive",
          subscription_end_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq("email", userEmail);

      return new Response(
        JSON.stringify({
          subscribed: false,
          user_tier: "free",
          subscription_status: "inactive",
          subscription_end: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for all subscriptions, prioritizing active ones
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    let subscriptionData = {
      subscribed: false,
      user_tier: "free" as const,
      subscription_status: "inactive" as const,
      subscription_end: null as string | null,
    };

    // Get user ID for logging
    const { data: userData, error: userError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError) {
      logStep("Error finding user profile", {
        email: userEmail,
        error: userError,
      });
    }
    const userId = userData?.id;

    // Find the most relevant subscription
    const activeSubscription = subscriptions.data.find((sub) =>
      ["active", "trialing"].includes(sub.status),
    );

    const pastDueSubscription =
      !activeSubscription &&
      subscriptions.data.find((sub) =>
        ["past_due", "incomplete", "incomplete_expired"].includes(sub.status),
      );

    const cancelledSubscription =
      !activeSubscription &&
      !pastDueSubscription &&
      subscriptions.data.find(
        (sub) =>
          sub.cancel_at_period_end &&
          new Date() < new Date(sub.current_period_end * 1000),
      );

    const subscription =
      activeSubscription ||
      pastDueSubscription ||
      cancelledSubscription ||
      (subscriptions.data.length > 0 ? subscriptions.data[0] : null);

    if (subscription) {
      // FIXED: Proper timestamp handling
      let subscriptionEnd: string | null = null;
      try {
        if (subscription.current_period_end) {
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

      // Check if subscription has expired
      if (hasExpired) {
        logStep("Subscription has expired, updating to free tier", {
          subscriptionId: subscription.id,
          endDate: subscriptionEnd,
          currentTime: now.toISOString(),
        });

        // Update user to free tier since subscription expired
        await supabaseClient
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: null,
            user_tier: "free",
            subscription_status: "inactive",
            subscription_end_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq("email", userEmail);

        // Log expiration event if we have the user ID
        if (userId) {
          await supabaseClient.from("subscription_history").insert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            event_type: "subscription_expired",
            subscription_tier: "free",
            status: "inactive",
            amount: 0,
            currency: "usd",
          });
        }

        return new Response(
          JSON.stringify({
            subscribed: false,
            user_tier: "free",
            subscription_status: "inactive",
            subscription_end: null,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      // Determine tier from price ID
      let tier: "free" | "premium" | "university" = "free";
      if (subscription.items.data.length > 0) {
        const priceId = subscription.items.data[0].price.id;
        logStep("Processing price ID for tier determination", { priceId });
        
        if (
          priceId === "price_1RX2JoQNAWy31QLb2GqkbTmu" || // Premium monthly
          priceId === "price_1RX2K2QNAWy31QLb2IrffIoS"    // Premium yearly
        ) {
          tier = "premium";
        } else if (
          priceId === "price_1RX2FjQNAWy31QLb6i2qw3zb" || // University monthly
          priceId === "price_1RX2HmQNAWy31QLbz0cY0LoR"    // University yearly
        ) {
          tier = "university";
        }
        logStep("Determined tier from price ID", { priceId, tier });
      }

      // FIXED: Improved status determination logic (consistent with webhook)
      let status: "active" | "cancelled" | "past_due" | "inactive";

      logStep("Analyzing subscription state", {
        stripeStatus: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        hasExpired,
        endDate: subscriptionEnd,
        currentTime: now.toISOString()
      });

      if (["active", "trialing"].includes(subscription.status)) {
        status = subscription.cancel_at_period_end ? "cancelled" : "active";
      } else if (
        ["past_due", "incomplete", "incomplete_expired"].includes(
          subscription.status,
        )
      ) {
        status = "past_due";
        // For past_due subscriptions, we still keep the tier but mark the status
      } else {
        status = "inactive";
        tier = "free";
      }

      subscriptionData = {
        subscribed: ["active", "trialing", "past_due"].includes(
          subscription.status,
        ) || subscription.cancel_at_period_end,
        user_tier: tier,
        subscription_status: status,
        subscription_end: subscriptionEnd,
      };

      logStep("Subscription found", {
        subscriptionId: subscription.id,
        tier,
        stripeStatus: subscription.status,
        finalStatus: status,
        endDate: subscriptionEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      // Update the database with current subscription info
      await supabaseClient
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          user_tier: tier,
          subscription_status: status,
          subscription_end_date: subscriptionEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("email", userEmail);

      logStep("Updated database with subscription info");
    } else {
      logStep("No subscription found");

      // Update user to free tier if no subscription
      await supabaseClient
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: null,
          user_tier: "free",
          subscription_status: "inactive",
          subscription_end_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq("email", userEmail);
    }

    return new Response(JSON.stringify(subscriptionData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
