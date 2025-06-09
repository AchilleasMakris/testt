
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserTier } from '@/hooks/useUserTier';
import { Crown, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  feature?: 'courses' | 'tasks' | 'notes';
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature }) => {
  const { tierData } = useUserTier();

  if (!tierData || tierData.user_tier !== 'free') {
    return null;
  }

  const featureText = feature ? `create more ${feature}` : 'unlock premium features';

  return (
    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-yellow-600" />
          Upgrade to Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          You've reached your free tier limit. Upgrade to {featureText} and access advanced features.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-green-600" />
            <span>20 courses, 100 tasks, 100 notes</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-green-600" />
            <span>Advanced analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-green-600" />
            <span>Priority support</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
          onClick={() => window.location.href = '/pricing'}
        >
          <Crown className="h-4 w-4 mr-2" />
          View Plans
        </Button>
      </CardContent>
    </Card>
  );
};
