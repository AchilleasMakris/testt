
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserTierData {
  user_tier: 'free' | 'premium' | 'university' | 'demo';
  courses_used: number;
  tasks_used: number;
  notes_used: number;
  subscription_status: 'inactive' | 'active' | 'cancelled' | 'past_due';
  subscription_end_date: string | null;
}

export const useUserTier = () => {
  const { user } = useAuth();
  const [tierData, setTierData] = useState<UserTierData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserTier = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user tier for:', user.email);

      // First try to get data from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('user_tier, courses_used, tasks_used, notes_used, subscription_status, subscription_end_date, stripe_customer_id, stripe_subscription_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user tier:', error);
        // Set default values on error
        setTierData({
          user_tier: 'free',
          courses_used: 0,
          tasks_used: 0,
          notes_used: 0,
          subscription_status: 'inactive',
          subscription_end_date: null
        });
        return;
      }

      console.log('Profile data:', data);

      // If user has subscription but no end date, try to refresh from Stripe
      if (data.user_tier !== 'free' && !data.subscription_end_date && user.email) {
        console.log('Missing subscription end date, checking with Stripe...');
        
        try {
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-subscription', {
            body: { userEmail: user.email }
          });

          if (!stripeError && stripeData) {
            console.log('Stripe data received:', stripeData);
            
            const userTier = (stripeData.user_tier as 'free' | 'premium' | 'university' | 'demo') || 'free';
            const subscriptionStatus = (stripeData.subscription_status as 'inactive' | 'active' | 'cancelled' | 'past_due') || 'inactive';
            
            // Update local state with fresh data
            setTierData({
              user_tier: userTier,
              courses_used: data.courses_used || 0,
              tasks_used: data.tasks_used || 0,
              notes_used: data.notes_used || 0,
              subscription_status: subscriptionStatus,
              subscription_end_date: stripeData.subscription_end
            });
            return;
          }
        } catch (stripeError) {
          console.error('Error checking subscription with Stripe:', stripeError);
        }
      }

      const userTier = (data.user_tier as 'free' | 'premium' | 'university' | 'demo') || 'free';
      const subscriptionStatus = (data.subscription_status as 'inactive' | 'active' | 'cancelled' | 'past_due') || 'inactive';

      setTierData({
        user_tier: userTier,
        courses_used: data.courses_used || 0,
        tasks_used: data.tasks_used || 0,
        notes_used: data.notes_used || 0,
        subscription_status: subscriptionStatus,
        subscription_end_date: data.subscription_end_date
      });
    } catch (error) {
      console.error('Error fetching user tier:', error);
      setTierData({
        user_tier: 'free',
        courses_used: 0,
        tasks_used: 0,
        notes_used: 0,
        subscription_status: 'inactive',
        subscription_end_date: null
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTier();
  }, [user?.id]);

  return {
    tierData,
    loading,
    refetch: fetchUserTier
  };
};
