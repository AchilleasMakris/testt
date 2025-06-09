import { useState, useEffect } from 'react';
import { capacitorService } from '../services/capacitor';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

export interface DeviceInfo {
  platform: string;
  model: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
}

export interface NetworkInfo {
  connected: boolean;
  connectionType: string;
}

export const useCapacitor = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const isNativePlatform = capacitorService.isNativePlatform();
      setIsNative(isNativePlatform);

      if (isNativePlatform) {
        // Get device info
        const device = await capacitorService.getDeviceInfo();
        if (device) {
          setDeviceInfo(device as DeviceInfo);
        }

        // Get network status
        const network = await capacitorService.getNetworkStatus();
        if (network) {
          setNetworkInfo({
            connected: network.connected,
            connectionType: network.connectionType
          });
        }

        // Listen for network changes
        const networkListener = Network.addListener('networkStatusChange', (status) => {
          setNetworkInfo({
            connected: status.connected,
            connectionType: status.connectionType
          });
        });

        return () => {
          networkListener.remove();
        };
      }
    };

    initialize();
  }, []);

  const hapticFeedback = async (style?: 'light' | 'medium' | 'heavy') => {
    const hapticStyle = style === 'light' ? 'Light' : style === 'heavy' ? 'Heavy' : 'Medium';
    await capacitorService.hapticFeedback(hapticStyle as any);
  };

  const setStatusBarStyle = async (style: 'dark' | 'light') => {
    await capacitorService.setStatusBarStyle(style);
  };

  const exitApp = async () => {
    await capacitorService.exitApp();
  };

  return {
    isNative,
    deviceInfo,
    networkInfo,
    hapticFeedback,
    setStatusBarStyle,
    exitApp
  };
};
