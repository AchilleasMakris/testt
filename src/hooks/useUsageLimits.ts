
import { useState, useMemo, useCallback } from 'react';
import { useUserTier, UserTierData } from '@/hooks/useUserTier';

const LIMITS = {
  free: {
    courses: 5,
    tasks: 5,
    notes: 5
  }
} as const;

export const useUsageLimits = () => {
  const { tierData, refetch } = useUserTier();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitType, setLimitType] = useState<'courses' | 'tasks' | 'notes'>('courses');

  const isPremiumUser = useMemo(() => {
    return tierData?.user_tier === 'premium' || tierData?.user_tier === 'university';
  }, [tierData?.user_tier]);

  const canCreateCourse = useCallback((): boolean => {
    if (!tierData) return false;
    if (isPremiumUser) return true;
    return tierData.courses_used < LIMITS.free.courses;
  }, [tierData, isPremiumUser]);

  const canCreateTask = useCallback((): boolean => {
    if (!tierData) return false;
    if (isPremiumUser) return true;
    return tierData.tasks_used < LIMITS.free.tasks;
  }, [tierData, isPremiumUser]);

  const canCreateNote = useCallback((): boolean => {
    if (!tierData) return false;
    if (isPremiumUser) return true;
    return tierData.notes_used < LIMITS.free.notes;
  }, [tierData, isPremiumUser]);

  const handleDatabaseError = useCallback((error: any, type: 'courses' | 'tasks' | 'notes') => {
    console.error('Database error:', error);
    
    // Check for usage limit errors from the database triggers
    if (error?.message?.includes('Usage limit exceeded') || 
        error?.message?.includes('Upgrade to premium') ||
        error?.message?.includes('usage limit')) {
      setLimitType(type);
      setShowLimitDialog(true);
      
      // Refresh tier data to get updated usage counts
      refetch();
      
      return true;
    }
    
    return false;
  }, [refetch]);

  const checkUsageLimit = useCallback((type: 'courses' | 'tasks' | 'notes'): boolean => {
    if (!tierData) return false;
    
    if (isPremiumUser) {
      return true;
    }

    const used = tierData[`${type}_used` as keyof UserTierData] as number;
    const limit = LIMITS.free[type];

    return used < limit;
  }, [tierData, isPremiumUser]);

  const refreshUsageData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    checkUsageLimit,
    canCreateCourse,
    canCreateTask,
    canCreateNote,
    handleDatabaseError,
    showLimitDialog,
    setShowLimitDialog,
    limitType,
    refreshUsageData
  };
};
