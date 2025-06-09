
"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { useNavigate } from "react-router-dom";

interface PricingPlan {
  name: string;
  price: string | number;
  yearlyPrice: string | number;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href?: string;
  billing?: string;
  buttonVariant?: "link" | "outline" | "default" | "destructive" | "secondary" | "ghost";
  isPopular: boolean;
  tier: string;
  onClick?: () => void;
  comingSoon?: string;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  onPlanClick?: (plan: PricingPlan) => void;
  loading?: string | null;
  isYearly?: boolean;
  onToggleYearly?: (isYearly: boolean) => void;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
  onPlanClick,
  loading,
  isYearly: externalIsYearly,
  onToggleYearly
}: PricingProps) {
  const navigate = useNavigate();
  const [internalIsMonthly, setInternalIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);
  
  // Use external state if provided, otherwise use internal state
  const isMonthly = externalIsYearly !== undefined ? !externalIsYearly : internalIsMonthly;
  
  const handleToggle = (checked: boolean) => {
    if (onToggleYearly) {
      // Use external state handler
      onToggleYearly(checked);
    } else {
      // Use internal state
      setInternalIsMonthly(!checked);
    }
    
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight
        },
        colors: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"],
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"]
      });
    }
  };

  const formattedPlans = plans.map((plan) => {
    if (plan.name === "FREE") {
      return { ...plan, yearlyPrice: plan.price };
    }

    return {
      ...plan,
      price: typeof plan.price === "string" ? parseFloat(plan.price) : plan.price,
      yearlyPrice: typeof plan.yearlyPrice === "string" ? parseFloat(plan.yearlyPrice) : plan.yearlyPrice || plan.price,
    };
  });  

  return (
    <div className="container space-y-8 py-8">
      <div className="flex justify-center items-center mb-8 gap-4 py-[19px]">
        <span className="font-medium text-lg text-white">Monthly</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch ref={switchRef as any} checked={!isMonthly} onCheckedChange={handleToggle} className="relative data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600" />
          </Label>
        </label>
        <span className="font-medium text-lg text-white">
          Annual billing 
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {formattedPlans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{
              y: 50,
              opacity: 0
            }}
            whileInView={{
              y: plan.isPopular ? -10 : 0,
              opacity: 1,
              scale: plan.isPopular ? 1.05 : 1
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: index * 0.1
            }}
            className={cn(
              "rounded-3xl border-2 p-8 text-center relative bg-black",
              plan.isPopular ? "border-white shadow-2xl shadow-white/20" : "border-gray-400",
              "flex flex-col h-full min-h-[600px]"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-2 border">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-semibold text-sm">Popular</span>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-400 mb-2 uppercase tracking-wider h-6">
                {plan.name}
              </h3>
              
              <div className="h-6">
                {plan.comingSoon && (
                  <p className="text-sm font-semibold text-white">
                    {plan.comingSoon}
                  </p>
                )}
              </div>

              <div className="mb-8 h-32">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-bold text-white">
                    {plan.tier === "free" ? (
                      "Free"
                    ) : (
                      <>
                        <NumberFlow
                          value={isMonthly ? 
                            (typeof plan.price === "string" ? parseInt(plan.price, 10) : plan.price) : 
                            (typeof plan.yearlyPrice === "string" ? parseInt(plan.yearlyPrice, 10) : plan.yearlyPrice)}
                          format={{
                            style: "decimal",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }}
                          transformTiming={{
                            duration: 500,
                            easing: "ease-out",
                          }}
                          willChange
                          className="font-variant-numeric: tabular-nums"
                        />
                        €
                      </>
                    )}
                  </span>
                  {plan.tier !== "free" && (
                    <span className="ml-1 text-lg text-gray-400">
                      /{isMonthly ? "Month" : "Year"}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-2 text-gray-500 min-h-[20px]">
                  {plan.tier !== "free" && (
                    isMonthly ? "Billed Monthly" : (plan.billing || "Billed Annually")
                  )}
                </p>
              </div>

              <ul className="space-y-4 mb-8 min-h-[220px] text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <div className="flex justify-center space-x-2 h-14">
                  {plan.buttonText && (
                    <button
                      onClick={() => {
                        if (!onPlanClick) {
                          navigate('/auth');
                        } else {
                          if (plan.tier !== "university") {
                            onPlanClick(plan);
                          }
                        }
                      }}
                      disabled={loading === plan.tier || plan.tier === "university"}
                      className={cn(
                        buttonVariants({
                          variant: plan.buttonVariant,
                          size: "lg"
                        }),
                        "font-semibold text-lg py-3 mb-4 rounded-xl min-w-[170px] transition-all duration-200",
                        (plan.isPopular || plan.tier === "university") 
                          ? `bg-white text-black border-white ${plan.tier === "premium" ? "hover:bg-white/90 hover:-translate-y-1" : "hover:bg-gray-100"}` 
                          : "border-gray-400 text-white hover:bg-gray-800 bg-transparent"
                      )}
                    >
                      {loading === plan.tier ? "Processing..." : plan.buttonText}
                    </button>
                  )}
                </div>
                {plan.description && (
                  <div className="text-xs text-gray-500">
                    {plan.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-1">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
