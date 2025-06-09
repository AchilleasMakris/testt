import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface MobileAwareProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  nativeClassName?: string;
  webClassName?: string;
  enableHapticFeedback?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

export const MobileAware: React.FC<MobileAwareProps> = ({
  children,
  className,
  mobileClassName,
  nativeClassName,
  webClassName,
  enableHapticFeedback = false,
  hapticStyle = 'medium'
}) => {
  const { isMobile, isNative, hapticFeedback } = useMobile();

  const handleClick = async (e: React.MouseEvent) => {
    if (enableHapticFeedback && isNative) {
      await hapticFeedback(hapticStyle);
    }
    
    // Propagate the click event
    const originalOnClick = (e.target as HTMLElement).onclick;
    if (originalOnClick) {
      originalOnClick.call(e.target, e as any);
    }
  };

  const combinedClassName = cn(
    className,
    {
      [mobileClassName || '']: isMobile && mobileClassName,
      [nativeClassName || '']: isNative && nativeClassName,
      [webClassName || '']: !isMobile && webClassName,
    }
  );

  return (
    <div 
      className={combinedClassName}
      onClick={enableHapticFeedback ? handleClick : undefined}
    >
      {children}
    </div>
  );
};

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  enableHapticFeedback?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  mobileClassName?: string;
  nativeClassName?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  className,
  mobileClassName,
  nativeClassName,
  enableHapticFeedback = true,
  hapticStyle = 'medium',
  onClick,
  ...props
}) => {
  const { isMobile, isNative, hapticFeedback } = useMobile();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableHapticFeedback && isNative) {
      await hapticFeedback(hapticStyle);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const combinedClassName = cn(
    className,
    {
      [mobileClassName || '']: isMobile && mobileClassName,
      [nativeClassName || '']: isNative && nativeClassName,
      // Add native-specific styles for better touch targets
      'min-h-[44px] min-w-[44px]': isNative, // iOS Human Interface Guidelines
    }
  );

  return (
    <button 
      className={combinedClassName}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
