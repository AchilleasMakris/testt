
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, ArrowRight } from 'lucide-react';

interface LimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: 'courses' | 'tasks' | 'notes';
}

export const LimitDialog: React.FC<LimitDialogProps> = ({ 
  open, 
  onOpenChange, 
  limitType 
}) => {
  const handleUpgrade = () => {
    window.location.href = '/settings?upgrade=true';
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Upgrade Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You've reached your free tier limit for {limitType}. Upgrade to Premium or University Pass to get unlimited access.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3 text-green-600" />
              <span>Unlimited {limitType}</span>
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
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
              onClick={handleUpgrade}
            >
              <Crown className="h-4 w-4 mr-2" />
              View Plans
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
