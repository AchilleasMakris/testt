import { createRoot } from "react-dom/client";
import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";
// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
import { ENV_CONFIG } from "./utils/environment";
import { capacitorService } from "./services/capacitor";

TempoDevtools.init();

// Initialize Capacitor when the app starts
capacitorService.initialize().catch(console.error);

// Add mobile-specific body classes for Capacitor
if (capacitorService.isNativePlatform()) {
  document.body.classList.add('capacitor', 'mobile-app');
  
  // Add platform-specific classes
  capacitorService.getDeviceInfo().then(deviceInfo => {
    if (deviceInfo?.platform) {
      document.body.classList.add(`platform-${deviceInfo.platform.toLowerCase()}`);
    }
  });
}

// Get Clerk publishable key from environment config
const CLERK_PUBLISHABLE_KEY = ENV_CONFIG.clerk.getPublishableKey();

// Enhanced validation with better error messaging
if (!CLERK_PUBLISHABLE_KEY) {
  // Create a user-friendly error message
  const errorMessage = `
    Missing Clerk Publishable Key Configuration
    
    Current environment: ${ENV_CONFIG.isProduction ? 'Production' : 'Development'}
    Current domain: ${window.location.hostname}
    On Lovable preview: ${ENV_CONFIG.domains.isOnLovablePreview()}
    
    To fix this:
    1. Go to your Lovable project settings
    2. Add environment variable: VITE_CLERK_PUBLISHABLE_KEY
    3. For development/preview: Use your Clerk TEST key (pk_test_...)
    4. For production: Use your Clerk LIVE key (pk_live_...)
    
    Your Clerk publishable key can be found in your Clerk dashboard under:
    Configure → API Keys → Publishable key
  `;
  
  console.error(errorMessage);
  
  // Show user-friendly error in the UI instead of just throwing
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    z-index: 9999;
    padding: 20px;
    box-sizing: border-box;
  `;
  
  errorDiv.innerHTML = `
    <div style="text-align: center; max-width: 600px;">
      <h1 style="color: #ef4444; margin-bottom: 20px;">Configuration Required</h1>
      <p style="margin-bottom: 15px;">Missing Clerk Publishable Key</p>
      <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; text-align: left;">
        <p style="margin: 0 0 10px 0;"><strong>Environment:</strong> ${ENV_CONFIG.isProduction ? 'Production' : 'Development'}</p>
        <p style="margin: 0 0 10px 0;"><strong>Domain:</strong> ${window.location.hostname}</p>
        <p style="margin: 0 0 10px 0;"><strong>Preview:</strong> ${ENV_CONFIG.domains.isOnLovablePreview() ? 'Yes' : 'No'}</p>
        <p style="margin: 0 0 10px 0;"><strong>To fix this:</strong></p>
        <ol style="margin: 0; padding-left: 20px;">
          <li>Go to your Lovable project settings</li>
          <li>Add environment variable: <code>VITE_CLERK_PUBLISHABLE_KEY</code></li>
          <li>Use a TEST key (pk_test_) for development/preview</li>
        </ol>
        <p style="margin: 15px 0 0 0;"><em>Find your key in Clerk dashboard → Configure → API Keys</em></p>
      </div>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
  
  // Still throw the error for proper error tracking
  throw new Error("Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY environment variable.");
}

// Use environment configuration for Clerk setup
const clerkConfig = {
  publishableKey: CLERK_PUBLISHABLE_KEY,
  ...ENV_CONFIG.clerk.getAuthUrls(),
  
  // Dynamic redirect origins based on environment
  allowedRedirectOrigins: ENV_CONFIG.clerk.getAllowedRedirectOrigins(),
  
  // Enhanced security for production
  appearance: {
    variables: {
      colorPrimary: "#2563eb"
    }
  }
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider {...clerkConfig}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);
