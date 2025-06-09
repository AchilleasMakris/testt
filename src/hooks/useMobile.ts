import { useCapacitor } from './useCapacitor';
import { useEffect, useState } from 'react';

export interface MobileContext {
  isMobile: boolean;
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  deviceInfo: any;
  networkInfo: any;
  hapticFeedback: (style?: 'light' | 'medium' | 'heavy') => Promise<void>;
  setStatusBarStyle: (style: 'dark' | 'light') => Promise<void>;
}

export const useMobile = (): MobileContext => {
  const { isNative, deviceInfo, networkInfo, hapticFeedback, setStatusBarStyle } = useCapacitor();
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    // Check if running on mobile (either native or mobile web browser)
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      
      return mobileRegex.test(userAgent.toLowerCase());
    };

    const isMobileDevice = checkMobile() || isNative;
    setIsMobile(isMobileDevice);

    // Determine platform
    if (isNative && deviceInfo) {
      setPlatform(deviceInfo.platform?.toLowerCase() === 'ios' ? 'ios' : 'android');
    } else if (isMobileDevice) {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        setPlatform('ios');
      } else if (userAgent.includes('android')) {
        setPlatform('android');
      }
    }
  }, [isNative, deviceInfo]);

  return {
    isMobile,
    isNative,
    platform,
    deviceInfo,
    networkInfo,
    hapticFeedback,
    setStatusBarStyle
  };
};
