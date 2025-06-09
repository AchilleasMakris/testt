
// Environment configuration utility for Clerk authentication with subdomain support

// Environment detection
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Production domain configuration
const MAIN_DOMAIN = "https://unitracker.store";
const AUTH_SUBDOMAIN = "https://accounts.unitracker.store";

// Production Clerk publishable key
const PRODUCTION_CLERK_KEY = "pk_live_Y2xlcmsudW5pdHJhY2tlci5zdG9yZSQ";

// Test Clerk publishable key for preview/development
const TEST_CLERK_KEY = "pk_test_Zmlyc3Qtd29vZGNvY2stNjQuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Check if we're on a Lovable preview domain
const isOnLovablePreview = () => {
  const hostname = window.location.hostname;
  return hostname.includes('.lovable.app') || hostname.includes('.lovableproject.com');
};

// Check if we're on a valid production domain (including www)
const isValidProductionDomain = () => {
  const hostname = window.location.hostname;
  return hostname === "unitracker.store" || 
         hostname === "www.unitracker.store" || 
         hostname === "accounts.unitracker.store";
};

// Check if we're on a valid domain (production or preview)
const isValidDomain = () => {
  return isValidProductionDomain() || isOnLovablePreview();
};

export const ENV_CONFIG = {
  isDevelopment,
  isProduction,
  
  // Domain configuration
  domains: {
    main: MAIN_DOMAIN,
    auth: AUTH_SUBDOMAIN,
    
    getCurrentDomain: () => {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port;
      
      // For Lovable preview or localhost, use current origin
      if (isOnLovablePreview() || hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      }
      
      if (hostname === "accounts.unitracker.store") {
        return AUTH_SUBDOMAIN;
      }
      return MAIN_DOMAIN;
    },
    
    isOnAuthSubdomain: () => {
      return window.location.hostname === "accounts.unitracker.store";
    },
    
    isValidProductionDomain,
    isOnLovablePreview,
    isValidDomain
  },
  
  // Clerk configuration
  clerk: {
    publishableKey: (() => {
      // Always prioritize the environment variable first
      const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
      if (envKey) {
        return envKey;
      }
      
      // For Lovable preview or development, use test key
      if (isOnLovablePreview() || isDevelopment) {
        return TEST_CLERK_KEY;
      }
      
      // Fallback to production key only for valid production domains
      if (isProduction && isValidProductionDomain()) {
        return PRODUCTION_CLERK_KEY;
      }
      
      return null;
    })(),
    
    // Get the publishable key
    getPublishableKey: () => {
      return ENV_CONFIG.clerk.publishableKey;
    },
    
    // Get authentication URLs based on current environment
    getAuthUrls: () => {
      const currentDomain = ENV_CONFIG.domains.getCurrentDomain();
      
      // For production domains, use specific auth subdomain
      if (isValidProductionDomain() && !isOnLovablePreview()) {
        return {
          signInUrl: `${AUTH_SUBDOMAIN}/sign-in`,
          signUpUrl: `${AUTH_SUBDOMAIN}/sign-up`,
          fallbackRedirectUrl: `${MAIN_DOMAIN}/dashboard`,
          afterSignOutUrl: MAIN_DOMAIN
        };
      }
      
      // For preview/development, use current domain
      return {
        signInUrl: `${currentDomain}/auth`,
        signUpUrl: `${currentDomain}/auth`,
        fallbackRedirectUrl: `${currentDomain}/dashboard`,
        afterSignOutUrl: currentDomain
      };
    },
    
    // Get allowed redirect origins
    getAllowedRedirectOrigins: () => {
      const origins = [MAIN_DOMAIN, AUTH_SUBDOMAIN];
      
      // Add current domain if it's a preview domain
      if (isOnLovablePreview()) {
        origins.push(ENV_CONFIG.domains.getCurrentDomain());
      }
      
      // Add localhost for development
      if (isDevelopment) {
        origins.push('http://localhost:5173', 'http://localhost:3000');
      }
      
      return origins;
    },
    
    // Enhanced validation for production with better error handling
    validateConfig: () => {
      const key = ENV_CONFIG.clerk.getPublishableKey();
      
      if (!key) {
        const errorMessage = `
Missing Clerk Publishable Key Configuration

Current environment: ${isProduction ? 'Production' : 'Development'}
Current domain: ${window.location.hostname}
Valid production domain: ${isValidProductionDomain()}
On Lovable preview: ${isOnLovablePreview()}

For development/preview environments:
1. Go to your Lovable project settings
2. Add environment variable: VITE_CLERK_PUBLISHABLE_KEY  
3. Set the value to your Clerk TEST publishable key (starts with pk_test_)

For production:
- The production key is already configured for unitracker.store domains

Your Clerk publishable key can be found in your Clerk dashboard under:
Configure → API Keys → Publishable key
        `;
        console.error(errorMessage);
        throw new Error('Missing Clerk publishable key. Please set VITE_CLERK_PUBLISHABLE_KEY environment variable.');
      }
      
      // Validate key format
      const keyPattern = /^pk_(test|live)_[a-zA-Z0-9]+$/;
      if (!keyPattern.test(key)) {
        console.error('Invalid Clerk publishable key format. Key should start with pk_test_ or pk_live_');
        throw new Error('Invalid Clerk publishable key format');
      }
      
      // Environment-specific validations
      if (isProduction && isValidProductionDomain() && !isOnLovablePreview()) {
        if (key.startsWith('pk_test_')) {
          console.warn('⚠️ WARNING: Using test key in production environment');
        }
      } else if (isOnLovablePreview() || isDevelopment) {
        if (key.startsWith('pk_live_')) {
          console.warn('⚠️ WARNING: Using production key in preview/development environment.');
          console.warn('💡 Consider using a test key (pk_test_) for development and preview.');
        }
      }
      
      return true;
    }
  },
  
  // Application URLs
  urls: {
    app: () => ENV_CONFIG.domains.getCurrentDomain(),
    
    getCurrentUrl: () => {
      return ENV_CONFIG.domains.getCurrentDomain();
    }
  },
  
  // Enhanced security settings for production
  security: {
    enableDetailedLogging: isDevelopment || isOnLovablePreview(),
    enableJWTValidation: true,
    enableSecurityHeaders: isProduction && isValidProductionDomain() && !isOnLovablePreview(),
    enableSubdomainCORS: isProduction,
    requireHTTPS: isProduction && isValidProductionDomain() && !isOnLovablePreview()
  }
};

// Initialize and validate configuration on import
try {
  ENV_CONFIG.clerk.validateConfig();
  
  console.log('🚀 Environment initialized');
  console.log('Mode:', isProduction ? 'Production' : 'Development');
  console.log('Valid production domain:', isValidProductionDomain());
  console.log('On Lovable preview:', isOnLovablePreview());
  console.log('Clerk Key type:', ENV_CONFIG.clerk.getPublishableKey()?.startsWith('pk_test_') ? 'Test' : 'Production');
  console.log('Current domain:', ENV_CONFIG.domains.getCurrentDomain());
  
  // Environment-specific logging
  if (isProduction && isValidProductionDomain() && !isOnLovablePreview()) {
    console.log('✅ Production environment validated');
  } else if (isOnLovablePreview()) {
    console.log('🔍 Lovable preview environment detected');
  } else {
    console.log('🧪 Development environment detected');
  }
} catch (error) {
  console.error('❌ Environment configuration error:', error);
}

export default ENV_CONFIG;
