
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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

    // First check our database for Stripe customer ID
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("email", userEmail)
      .single();

    logStep("Profile lookup result", { 
      profileData, 
      profileError: profileError?.message 
    });

    let customerId = profileData?.stripe_customer_id;
    let subscriptionId = profileData?.stripe_subscription_id;

    // If no customer ID in database, try to find in Stripe
    if (!customerId) {
      logStep("No customer ID in database, searching Stripe");
      const customers = await stripe.customers.list({ 
        email: userEmail, 
        limit: 1 
      });
      
      if (customers.data.length === 0) {
        logStep("No Stripe customer found");
        return new Response(JSON.stringify({ 
          error: "No subscription found for this user" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }
      
      customerId = customers.data[0].id;
      logStep("Found customer in Stripe", { customerId });
      
      // Update our database with the found customer ID
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("email", userEmail);
      
      logStep("Updated database with customer ID");
    }

    // Find active subscriptions
    let activeSubscription;
    
    if (subscriptionId) {
      // Try to get the specific subscription first
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (["active", "trialing"].includes(subscription.status)) {
          activeSubscription = subscription;
          logStep("Found active subscription by ID", { subscriptionId });
        }
      } catch (error) {
        logStep("Subscription ID invalid or not found", { subscriptionId, error: error.message });
      }
    }

    // If no active subscription found by ID, search all customer subscriptions
    if (!activeSubscription) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      if (subscriptions.data.length === 0) {
        logStep("No active subscriptions found");
        return new Response(JSON.stringify({ 
          error: "No active subscription found to cancel" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      activeSubscription = subscriptions.data[0];
      logStep("Found active subscription", { subscriptionId: activeSubscription.id });
    }

    // Cancel the subscription at period end
    const updatedSubscription = await stripe.subscriptions.update(activeSubscription.id, {
      cancel_at_period_end: true,
    });

    logStep("Subscription cancelled at period end", { 
      subscriptionId: updatedSubscription.id,
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      periodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString()
    });

    // Update our database
    await supabaseClient
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: updatedSubscription.id,
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("email", userEmail);

    logStep("Updated database with cancellation status");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Subscription will be cancelled at the end of the current billing period",
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
      periodEnd: new Date(updatedSubscription.current_period_end * 1000).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
