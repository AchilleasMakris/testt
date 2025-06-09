import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

class CapacitorService {
  private isNative = Capacitor.isNativePlatform();

  async initialize() {
    if (!this.isNative) {
      console.log('Running in web mode - Capacitor features disabled');
      return;
    }

    try {
      // Configure fullscreen immersive mode
      await this.enableFullscreenMode();

      // Configure status bar for fullscreen
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setOverlaysWebView({ overlay: true });

      // Don't hide splash screen automatically - let the app component handle it
      // SplashScreen will be hidden by AppSplashScreen component

      // Setup keyboard listeners
      Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('Keyboard will show:', info.keyboardHeight);
        // Adjust viewport when keyboard shows
        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      });

      Keyboard.addListener('keyboardDidHide', () => {
        console.log('Keyboard hidden');
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      });

      // Setup app state listeners
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
        if (isActive) {
          // Re-enable fullscreen when app becomes active
          this.enableFullscreenMode();
        }
      });

      // Setup network listeners
      Network.addListener('networkStatusChange', (status) => {
        console.log('Network status changed:', status);
      });

      console.log('Capacitor initialized successfully');
    } catch (error) {
      console.error('Error initializing Capacitor:', error);
    }
  }

  // Enable fullscreen immersive mode
  async enableFullscreenMode() {
    if (!this.isNative) return;
    
    try {
      // Hide navigation buttons and make status bar transparent
      await StatusBar.hide();
      
      // Add CSS class for fullscreen mode
      document.body.classList.add('fullscreen-mode');
      
      // Set CSS custom properties for safe areas
      document.documentElement.style.setProperty('--status-bar-height', '0px');
      document.documentElement.style.setProperty('--navigation-bar-height', '0px');
      
    } catch (error) {
      console.error('Error enabling fullscreen mode:', error);
    }
  }

  // Utility methods
  isNativePlatform() {
    return this.isNative;
  }

  async getDeviceInfo() {
    if (!this.isNative) return null;
    try {
      return await Device.getInfo();
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }

  async getNetworkStatus() {
    if (!this.isNative) return null;
    try {
      return await Network.getStatus();
    } catch (error) {
      console.error('Error getting network status:', error);
      return null;
    }
  }

  async hapticFeedback(style: ImpactStyle = ImpactStyle.Medium) {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Error with haptic feedback:', error);
    }
  }

  async setStatusBarStyle(style: 'dark' | 'light') {
    if (!this.isNative) return;
    try {
      await StatusBar.setStyle({ 
        style: style === 'dark' ? Style.Dark : Style.Light 
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  }

  async exitApp() {
    if (!this.isNative) return;
    try {
      await App.exitApp();
    } catch (error) {
      console.error('Error exiting app:', error);
    }
  }

  async hideSplashScreen() {
    if (!this.isNative) return;
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  }
}
}

export const capacitorService = new CapacitorService();
