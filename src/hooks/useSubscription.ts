
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionData {
  subscribed: boolean;
  user_tier: 'free' | 'premium' | 'university' | 'demo';
  subscription_status: 'inactive' | 'active' | 'cancelled' | 'past_due';
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      console.log('Checking subscription for user:', user.email);

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userEmail: user.email }
      });

      if (error) {
        console.error('Subscription check error:', error);
        // Fallback to local profile data if edge function fails
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_tier, subscription_status, subscription_end_date')
          .eq('email', user.email)
          .single();
        
        if (profileData) {
          const userTier = (profileData.user_tier as 'free' | 'premium' | 'university' | 'demo') || 'free';
          const subscriptionStatus = (profileData.subscription_status as 'inactive' | 'active' | 'cancelled' | 'past_due') || 'inactive';
          
          setSubscriptionData({
            subscribed: userTier !== 'free',
            user_tier: userTier,
            subscription_status: subscriptionStatus,
            subscription_end: profileData.subscription_end_date
          });
        } else {
          // Set default free tier if no profile data
          setSubscriptionData({
            subscribed: false,
            user_tier: 'free',
            subscription_status: 'inactive',
            subscription_end: null
          });
        }
        return;
      }

      console.log('Subscription data received:', data);
      
      // Validate the data structure before setting it
      if (data && typeof data === 'object') {
        const userTier = (data.user_tier as 'free' | 'premium' | 'university' | 'demo') || 'free';
        const subscriptionStatus = (data.subscription_status as 'inactive' | 'active' | 'cancelled' | 'past_due') || 'inactive';
        
        setSubscriptionData({
          subscribed: Boolean(data.subscribed),
          user_tier: userTier,
          subscription_status: subscriptionStatus,
          subscription_end: data.subscription_end || null
        });

        // Show toast for status changes that affect user experience
        if (subscriptionStatus === 'past_due') {
          toast({
            title: "Payment Issue",
            description: "Your subscription payment is past due. Please update your payment method.",
            variant: "destructive"
          });
        } else if (subscriptionStatus === 'cancelled') {
          toast({
            title: "Subscription Cancelled",
            description: "Your subscription will end at the current billing period.",
            variant: "destructive"
          });
        }
      } else {
        throw new Error('Invalid response format from subscription check');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Set default free tier on error
      setSubscriptionData({
        subscribed: false,
        user_tier: 'free',
        subscription_status: 'inactive',
        subscription_end: null
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { userEmail: user.email }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Customer portal error:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Set up periodic checking every 30 seconds
    const interval = setInterval(checkSubscription, 30000);
    
    return () => clearInterval(interval);
  }, [user?.email]);

  return {
    subscriptionData,
    loading,
    refetch: checkSubscription,
    openCustomerPortal
  };
};
