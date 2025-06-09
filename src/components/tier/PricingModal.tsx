
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/ClerkAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePricingModal } from "./MobilePricingModal";
import { Pricing } from "@/components/ui/pricing";

// Updated pricing plans with correct prices
const pricingPlans = [
  {
    name: "Free",
    description: "Basic features for getting started",
    price: "0",
    yearlyPrice: "0",
    period: "month",
    features: [
      "Up to 5 courses",
      "Up to 5 tasks",
      "Up to 5 notes",
      "Basic analytics",
    ],
    buttonText: "Current Plan",
    isPopular: false,
    tier: "free",
    href: "#",
  },
  {
    name: "Premium",
    description: "Unlock all features and unlimited usage",
    price: "3",
    yearlyPrice: "25",
    period: "month",
    billing: "Billed yearly",
    features: [
      "Unlimited courses",
      "Unlimited tasks",
      "Unlimited notes",
      "Advanced analytics",
      "Priority support",
    ],
    buttonText: "Upgrade to Premium",
    isPopular: true,
    tier: "premium",
    href: "#",
  },
  {
    name: "University",
    description: "Special pricing for university students.\n.edu or academic email required",
    price: "1.5",
    yearlyPrice: "10",
    period: "month",
    billing: "Billed yearly",
    features: [
      "Unlimited courses",
      "Unlimited tasks",
      "Unlimited notes",
      "Advanced analytics",
      "Priority support",
    ],
    buttonText: "Soon",
    isPopular: false,
    tier: "university",
    href: "#",
    comingSoon: "(Soon)",
  },
];

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [isYearly, setIsYearly] = React.useState(false);
  const isMobile = useIsMobile();

  const handleCheckout = async (plan: typeof pricingPlans[0]) => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      return;
    }

    if (plan.tier === "free") {
      return; // Can't checkout for free plan
    }

    setLoading(plan.tier);

    try {
      console.log("Starting checkout for plan:", plan.tier);

      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            tier: plan.tier,
            userEmail: user.email,
            billingPeriod: isYearly ? "yearly" : "monthly",
          },
        },
      );

      if (error) {
        console.error("Checkout error:", error);
        throw error;
      }

      if (data?.url) {
        console.log("Redirecting to checkout:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Use mobile modal on mobile devices
  if (isMobile) {
    return <MobilePricingModal open={open} onClose={onClose} />;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 rounded-2xl shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold z-10"
          >
            &times;
          </button>
          
          <Pricing
            plans={pricingPlans}
            title="Simple and transparent pricing"
            description="Choose the plan that suits your needs. No hidden fees, no surprises."
            onPlanClick={handleCheckout}
            loading={loading}
            isYearly={isYearly}
            onToggleYearly={setIsYearly}
          />
        </div>
      </motion.div>
    </div>
  );
};
