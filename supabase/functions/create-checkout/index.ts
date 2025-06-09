
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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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

    const { tier, userEmail, billingPeriod } = await req.json();
    logStep("Request validated", { tier, userEmail, billingPeriod });

    if (!tier || !userEmail) {
      throw new Error("Missing required fields: tier, userEmail");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // UPDATED: Use your new price IDs
    const priceMapping = {
      premium: {
        monthly: "price_1RX2JoQNAWy31QLb2GqkbTmu",
        yearly: "price_1RX2K2QNAWy31QLb2IrffIoS",
      },
      university: {
        monthly: "price_1RX2FjQNAWy31QLb6i2qw3zb",
        yearly: "price_1RX2HmQNAWy31QLbz0cY0LoR",
      },
    };

    const priceId = priceMapping[tier]?.[billingPeriod || "monthly"];
    if (!priceId) {
      throw new Error(`Invalid tier or billing period: ${tier}, ${billingPeriod}`);
    }

    logStep("Selected price ID", { tier, billingPeriod, priceId });

    const origin = req.headers.get("origin") || "https://elegant-glow.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/settings?success=true`,
      cancel_url: `${origin}/settings?canceled=true`,
      metadata: {
        tier: tier,
        userEmail: userEmail,
      },
    });

    logStep("Checkout session created", {
      sessionId: session.id,
      url: session.url,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
