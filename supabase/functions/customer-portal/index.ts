
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
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
    const { data: profileData } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("email", userEmail)
      .single();

    let customerId = profileData?.stripe_customer_id;

    // If no customer ID in database, try to find in Stripe
    if (!customerId) {
      logStep("No customer ID in database, searching Stripe");
      const customers = await stripe.customers.list({ 
        email: userEmail, 
        limit: 1 
      });
      
      if (customers.data.length === 0) {
        throw new Error("No Stripe customer found for this user");
      }
      
      customerId = customers.data[0].id;
      logStep("Found customer in Stripe", { customerId });
      
      // Update our database with the found customer ID
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("email", userEmail);
      
      logStep("Updated database with customer ID");
    } else {
      logStep("Found Stripe customer in database", { customerId });
    }

    const origin = req.headers.get("origin") || "https://elegant-glow.lovable.app";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });
    
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
