# 📱 Mobile Development Guide for Trackr One

This project is now configured to work with Capacitor for native Android and iOS development.

## 🚀 Quick Start Commands

### Development Workflow
```powershell
# 1. Start development server
npm run dev

# 2. Build and sync to mobile platforms
npm run cap:build

# 3. Open in native IDEs
npm run cap:android    # Opens Android Studio
npm run cap:ios        # Opens Xcode (macOS only)
```

## 🔧 Setup Requirements

### Android Development Setup
1. **Install Android Studio**: Download from [developer.android.com](https://developer.android.com/studio)
2. **Configure Android SDK**: Open Android Studio → SDK Manager → Install latest SDK
3. **Set Environment Variables**:
   ```powershell
   # Add these to your system environment variables
   ANDROID_HOME=C:\Users\[USERNAME]\AppData\Local\Android\Sdk
   PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
   ```
4. **Enable Developer Options** on your Android device
5. **Enable USB Debugging** in Developer Options

### iOS Development Setup (macOS only)
1. **Install Xcode**: From Mac App Store
2. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

## Available Scripts

### Development
- `npm run dev` - Run the web development server
- `npm run build` - Build the web application
- `npm run cap:build` - Build the web app and sync with native platforms

### Capacitor Commands
- `npm run cap:sync` - Sync web assets and plugins with native platforms
- `npm run cap:android` - Open Android project in Android Studio
- `npm run cap:ios` - Open iOS project in Xcode
- `npm run cap:run:android` - Build and run on Android device/emulator
- `npm run cap:run:ios` - Build and run on iOS device/simulator

## Prerequisites

### For Android Development
1. **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
2. **Java Development Kit (JDK) 17** - Required for Android builds
3. **Android SDK** - Installed through Android Studio
4. **Android device or emulator** - For testing

### For iOS Development (macOS only)
1. **Xcode** - Download from Mac App Store
2. **Xcode Command Line Tools** - Install via `xcode-select --install`
3. **CocoaPods** - Install via `sudo gem install cocoapods`
4. **iOS device or simulator** - For testing

## Getting Started

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Sync with native platforms
npm run cap:sync
```

### 2. Android Development
```bash
# Open Android project in Android Studio
npm run cap:android

# Or build and run directly
npm run cap:run:android
```

### 3. iOS Development (macOS only)
```bash
# Open iOS project in Xcode
npm run cap:ios

# Or build and run directly
npm run cap:run:ios
```

## Mobile Features

### Capacitor Service
The app includes a `CapacitorService` that provides:
- Device information
- Network status monitoring
- Haptic feedback
- Status bar control
- App state management

### Custom Hooks
- `useCapacitor()` - Access to all Capacitor functionality
- `useMobile()` - Mobile-aware state and utilities

### Mobile Components
- `<MobileAware>` - Container that adapts to mobile/native environments
- `<MobileButton>` - Button with automatic haptic feedback

### Example Usage
```typescript
import { useMobile } from '@/hooks/useMobile';
import { MobileButton } from '@/components/mobile/MobileAware';

function MyComponent() {
  const { isMobile, isNative, hapticFeedback } = useMobile();

  return (
    <div>
      <p>Running on: {isNative ? 'Native App' : 'Web Browser'}</p>
      <MobileButton 
        enableHapticFeedback={true}
        onClick={() => console.log('Button clicked!')}
      >
        Click me
      </MobileButton>
    </div>
  );
}
```

## Configuration

### Capacitor Config (`capacitor.config.ts`)
- **App ID**: `io.trackrone.app`
- **App Name**: `Trackr One`
- **Web Directory**: `dist`
- **Plugins**: Configured for status bar, splash screen, keyboard, haptics, etc.

### Supported Plugins
- **@capacitor/app** - App state and URL handling
- **@capacitor/device** - Device information
- **@capacitor/haptics** - Tactile feedback
- **@capacitor/keyboard** - Keyboard events and control
- **@capacitor/network** - Network status monitoring
- **@capacitor/preferences** - Local storage
- **@capacitor/splash-screen** - Launch screen control
- **@capacitor/status-bar** - Status bar styling

## Building for Production

### Android
1. Open the project in Android Studio: `npm run cap:android`
2. Build → Generate Signed Bundle/APK
3. Follow the Android signing process

### iOS
1. Open the project in Xcode: `npm run cap:ios`
2. Select your development team
3. Archive and upload to App Store Connect

## Troubleshooting

### Common Issues
1. **Build fails**: Ensure you've run `npm run build` before `cap:sync`
2. **Android Studio won't open**: Check Java/Android SDK installation
3. **iOS build fails**: Ensure Xcode and Command Line Tools are installed
4. **Plugin not working**: Run `npm run cap:sync` after installing new plugins

### Platform-Specific Notes
- **Android**: Requires API level 24 (Android 7.0) or higher
- **iOS**: Requires iOS 13.0 or higher
- **Web**: Capacitor plugins gracefully degrade on web platforms

## Development Workflow

1. Make changes to your React code
2. Test in web browser: `npm run dev`
3. Build and sync: `npm run cap:build`
4. Test on native platforms: `npm run cap:run:android` or `npm run cap:run:ios`
5. Debug using browser developer tools (Chrome DevTools for Android, Safari Web Inspector for iOS)

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Development](https://developer.android.com/)
- [iOS Development](https://developer.apple.com/ios/)
- [Capacitor Community Plugins](https://github.com/capacitor-community)
