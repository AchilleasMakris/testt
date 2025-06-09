import React from 'react';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileBottomNav } from './MobileBottomNav';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showStatusBar?: boolean;
  showBottomNav?: boolean;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showStatusBar = true,
  showBottomNav = true,
  className
}) => {
  const { isMobile, isNative } = useMobile();

  return (
    <div className={cn(
      "min-h-screen bg-background",
      {
        "mobile-full-height": isNative,
        "pb-20": isMobile && showBottomNav, // Add bottom padding for mobile nav
      },
      className
    )}>
      {/* Mobile Status Bar */}
      {showStatusBar && (
        <MobileStatusBar title={title} />
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto",
        {
          "mobile-scroll no-bounce": isMobile,
        }
      )}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && (
        <MobileBottomNav />
      )}
    </div>
  );
};
