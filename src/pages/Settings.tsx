
import React, { useEffect, useState } from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { SubscriptionManagement } from '@/components/tier/SubscriptionManagement';
import { PricingModal } from '@/components/tier/PricingModal';
import { useToast } from '@/hooks/use-toast';
import { useUserTier } from '@/hooks/useUserTier';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageHeader } from '@/components/ui/PageHeader';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { refetch } = useUserTier();
  const [isPricingModalOpen, setPricingModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Check for upgrade parameter to open pricing modal
    if (params.get('upgrade') === 'true') {
      setPricingModalOpen(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (params.get('success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. It may take a few moments to update.",
        duration: 5000
      });

      // Refetch user tier data multiple times to ensure we get the updated status
      setTimeout(() => refetch(), 1000);
      setTimeout(() => refetch(), 3000);
      setTimeout(() => refetch(), 5000);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('canceled') === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again anytime.",
        variant: "destructive"
      });

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, refetch]);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={<SettingsIcon className="h-6 w-6 text-blue-600" />}
        title="Settings"
        subtitle="Manage your account preferences and profile information"
      />

      <div className="w-full">
        <SubscriptionManagement />
      </div>

      <div className="w-full">
        <UserProfile />
      </div>

      {isPricingModalOpen && (
        <PricingModal 
          open={isPricingModalOpen} 
          onClose={() => setPricingModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Settings;
