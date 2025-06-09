
import React from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/ClerkAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
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
    description: ".edu or academic email required",
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

interface MobilePricingModalProps {
  open: boolean;
  onClose: () => void;
}

export const MobilePricingModal: React.FC<MobilePricingModalProps> = ({
  open,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [isYearly, setIsYearly] = React.useState(false);

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

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[95vh] bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200">
        <DrawerHeader className="text-center border-b border-blue-300/30">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold text-gray-800">
              Choose your plan
            </DrawerTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-800 hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <DrawerDescription className="text-gray-700">Simple and transparent pricing</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <Pricing
            plans={pricingPlans}
            title=""
            description=""
            onPlanClick={handleCheckout}
            loading={loading}
            isYearly={isYearly}
            onToggleYearly={setIsYearly}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
