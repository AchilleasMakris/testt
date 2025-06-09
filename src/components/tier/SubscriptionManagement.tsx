import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Calendar, CreditCard, ExternalLink, GraduationCap, ListTodo, FileText, X, RefreshCw } from "lucide-react";
import { useUserTier } from "@/hooks/useUserTier";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/ClerkAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PricingModal } from "@/components/tier/PricingModal";

export const SubscriptionManagement = () => {
  const {
    tierData,
    loading,
    refetch
  } = useUserTier();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleRefreshSubscription = async () => {
    if (!user?.email) return;
    setIsRefreshing(true);
    try {
      console.log('Manually refreshing subscription data...');
      const {
        data,
        error
      } = await supabase.functions.invoke('check-subscription', {
        body: {
          userEmail: user.email
        }
      });
      if (error) {
        console.error('Error refreshing subscription:', error);
        toast({
          title: "Error",
          description: "Failed to refresh subscription data. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Subscription refresh successful:', data);
        toast({
          title: "Subscription Updated",
          description: "Your subscription data has been refreshed."
        });
        // Refetch user data to update UI
        await refetch();
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Error",
        description: "Failed to refresh subscription data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCustomerPortal = async () => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your subscription",
        variant: "destructive"
      });
      return;
    }

    // Check if user has a subscription before opening portal
    if (!tierData || tierData.user_tier === 'free') {
      toast({
        title: "No Subscription Found",
        description: "You need an active subscription to access the billing portal.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { userEmail: user.email }
      });

      if (error) {
        console.error("Customer portal error:", error);
        toast({
          title: "Error",
          description: "Failed to open customer portal. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Customer portal error:", error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to cancel your subscription",
        variant: "destructive"
      });
      return;
    }

    // Validate subscription exists before attempting cancellation
    if (!tierData || tierData.user_tier === 'free') {
      toast({
        title: "No Active Subscription",
        description: "You don't have an active subscription to cancel.",
        variant: "destructive"
      });
      return;
    }

    if (tierData.subscription_status === 'cancelled') {
      toast({
        title: "Already Cancelled",
        description: "Your subscription is already cancelled.",
        variant: "destructive"
      });
      return;
    }

    setIsCancelling(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("cancel-subscription", {
        body: {
          userEmail: user.email
        }
      });

      if (error) {
        console.error("Cancel subscription error:", error);
        
        // Handle specific error cases
        if (error.message?.includes("No subscription found") || 
            error.message?.includes("No active subscription found")) {
          toast({
            title: "No Active Subscription",
            description: "No active subscription found to cancel. Your subscription may have already been cancelled or expired.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Cancellation Failed",
            description: `Failed to cancel subscription: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll retain access until the end of your billing period."
      });

      // Refresh subscription data after successful cancellation
      setTimeout(async () => {
        await refetch();
      }, 2000);

    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    // Removed continuous polling logic to avoid unnecessary fetches
  }, []);

  if (loading) {
    return <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>;
  }

  const isPremium = tierData?.user_tier === "premium" || tierData?.user_tier === "university";
  const courseLimit = isPremium ? Infinity : 5;
  const taskLimit = isPremium ? Infinity : 5;
  const noteLimit = isPremium ? Infinity : 5;
  const coursesUsed = tierData?.courses_used || 0;
  const tasksUsed = tierData?.tasks_used || 0;
  const notesUsed = tierData?.notes_used || 0;

  const getProgressValue = (used: number, limit: number) => {
    if (limit === Infinity) return 0;
    return used / limit * 100;
  };

  const formatSubscriptionEndDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case "university":
        return "University Plan";
      case "premium":
        return "Premium Plan";
      default:
        return "Free Plan";
    }
  };

  return <div className="space-y-4 sm:space-y-6">
      {/* Usage Limits Card - Only show for free users */}
      {!isPremium && <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              Usage Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Courses */}
            <div className="space-y-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-600" />
                  <span>Courses</span>
                </div>
                <span className="font-medium">
                  {coursesUsed}/{courseLimit} used
                </span>
              </div>
              <Progress value={getProgressValue(coursesUsed, courseLimit)} className="h-2" />
            </div>

            {/* Tasks */}
            <div className="space-y-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-gray-600" />
                  <span>Tasks</span>
                </div>
                <span className="font-medium">
                  {tasksUsed}/{taskLimit} used
                </span>
              </div>
              <Progress value={getProgressValue(tasksUsed, taskLimit)} className="h-2" />
            </div>

            {/* Notes */}
            <div className="space-y-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 p-3 rounded-lg border border-blue-200 text-black">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span>Notes</span>
                </div>
                <span className="font-medium">
                  {notesUsed}/{noteLimit} used
                </span>
              </div>
              <Progress value={getProgressValue(notesUsed, noteLimit)} className="h-2" />
            </div>
          </CardContent>
        </Card>}

      {/* Premium Features / Subscription Card */}
      <Card className="w-full overflow-hidden">
        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-gray-800 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {isPremium ? <>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      {getTierDisplayName(tierData?.user_tier || "free")}
                    </h3>
                    {tierData?.subscription_end_date && <div className="flex items-center gap-2 text-gray-700 text-sm mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Valid until{" "}
                          {formatSubscriptionEndDate(tierData.subscription_end_date)}
                        </span>
                      </div>}
                    {!tierData?.subscription_end_date && <div className="flex items-center gap-2 text-gray-700 text-sm mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>Subscription date not available</span>
                        <Button onClick={handleRefreshSubscription} disabled={isRefreshing} variant="ghost" size="sm" className="text-gray-700 hover:text-gray-800 hover:bg-gradient-to-r hover:from-blue-200 hover:to-purple-200 p-1 h-auto">
                          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>}

                    {/* Premium Features Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Unlimited courses</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Unlimited tasks</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Advanced analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Priority support</span>
                      </div>
                    </div>
                  </> : <>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      Unlock Premium Features
                    </h3>
                    <p className="text-sm sm:text-base mb-4 text-black">
                      Get unlimited access to all features
                    </p>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 text-black">
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-black">Unlimited courses</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-black">Unlimited tasks</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-black">Advanced analytics</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-black">Priority support</span>
                      </div>
                    </div>
                  </>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {!isPremium && <div className="text-gray-700 text-sm order-2 sm:order-1 text-black">
                  Starting at €3/month
                </div>}

              <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                {isPremium && <>
                    <Badge className={`${tierData?.subscription_status === "cancelled" ? "bg-red-500 text-white text-xs sm:text-sm px-2 py-1 rounded-md" : "bg-white/20 border-gray-600/30 text-gray-800 text-xs sm:text-sm px-2 py-1 rounded-md"}`}>
                      {getTierDisplayName(tierData?.user_tier || "free")} {" "}
                      {tierData?.subscription_status === "cancelled" ? "Canceled" : "Active"}
                    </Badge>
                    <Button onClick={handleCustomerPortal} variant="outline" size="sm" className="bg-white/20 border-gray-600/30 text-gray-800 hover:bg-gradient-to-r hover:from-blue-300 hover:to-purple-300 hover:text-gray-800 text-xs sm:text-sm transition-all duration-200">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Billing Portal
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </Button>

                    {tierData?.subscription_status !== "cancelled" && <Button 
                        onClick={handleCancelSubscription} 
                        disabled={isCancelling}
                        variant="outline" 
                        size="sm" 
                        className="bg-red-500/20 border-red-300/30 text-gray-800 hover:bg-gradient-to-r hover:from-red-400 hover:to-red-500 hover:text-white text-xs sm:text-sm transition-all duration-200"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        {isCancelling ? "Cancelling..." : "Cancel Subscription"}
                      </Button>}
                  </>}

                {!isPremium && <Button onClick={() => setPricingModalOpen(true)} variant="secondary" size={isMobile ? "default" : "sm"} className="bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 font-medium text-sm transition-all duration-200 text-black">
                    Upgrade Now
                  </Button>}

                {isPricingModalOpen && <PricingModal open={isPricingModalOpen} onClose={() => setPricingModalOpen(false)} />}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>;
};
