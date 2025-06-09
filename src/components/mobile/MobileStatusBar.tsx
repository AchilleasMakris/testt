import React, { useEffect } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface MobileStatusBarProps {
  title?: string;
  showTitle?: boolean;
  className?: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  title = 'Trackr One',
  showTitle = true,
  className
}) => {
  const { isNative, setStatusBarStyle } = useMobile();

  useEffect(() => {
    if (isNative) {
      // Set status bar style - you can make this dynamic based on your app's theme
      setStatusBarStyle('dark');
    }
  }, [isNative, setStatusBarStyle]);

  if (!isNative) return null;

  return (
    <div className={cn(
      "ios-safe-area-top",
      "bg-white dark:bg-gray-900",
      "flex items-center justify-center",
      "h-12",
      className
    )}>
      {showTitle && (
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
      )}
    </div>
  );
};
