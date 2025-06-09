
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { LimitDialog } from '@/components/usage/LimitDialog';
import { useToast } from '@/hooks/use-toast';

interface CreateButtonProps {
  feature: 'courses' | 'tasks' | 'notes';
  onOpenDialog: () => void;
  onCreateSuccess?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CreateButton: React.FC<CreateButtonProps> = ({ 
  feature,
  onOpenDialog,
  onCreateSuccess,
  children,
  className = "flex items-center gap-2"
}) => {
  const { toast } = useToast();
  const { 
    canCreateCourse,
    canCreateTask,
    canCreateNote,
    handleDatabaseError, 
    showLimitDialog, 
    setShowLimitDialog, 
    limitType,
    refreshUsageData
  } = useUsageLimits();

  const canCreate = () => {
    switch (feature) {
      case 'courses':
        return canCreateCourse();
      case 'tasks':
        return canCreateTask();
      case 'notes':
        return canCreateNote();
      default:
        return false;
    }
  };

  const handleClick = () => {
    // Check usage limit before opening dialog
    if (!canCreate()) {
      setShowLimitDialog(true);
      return;
    }

    // If we can create, open the dialog
    onOpenDialog();
  };

  const handleCreateError = (error: any) => {
    const wasLimitError = handleDatabaseError(error, feature);
    if (!wasLimitError) {
      // Handle other types of errors
      console.error(`${feature} creation error:`, error);
      toast({
        title: "Error",
        description: `Failed to create ${feature.slice(0, -1)}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleCreateSuccessWrapper = async () => {
    // Refresh usage data after successful creation
    await refreshUsageData();
    
    // Call the original success handler if provided
    if (onCreateSuccess) {
      onCreateSuccess();
    }
  };

  // Expose error handler and success wrapper for parent components to use
  React.useEffect(() => {
    if (onCreateSuccess) {
      (window as any)[`handle${feature.charAt(0).toUpperCase() + feature.slice(1)}Error`] = handleCreateError;
      (window as any)[`handle${feature.charAt(0).toUpperCase() + feature.slice(1)}Success`] = handleCreateSuccessWrapper;
    }
  }, [onCreateSuccess, feature]);

  return (
    <>
      <Button
        onClick={handleClick}
        className={className}
      >
        <Plus className="h-4 w-4" />
        {children}
      </Button>

      <LimitDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        limitType={limitType}
      />
    </>
  );
};
