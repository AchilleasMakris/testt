
import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/ui/card';
import { ENV_CONFIG } from '@/utils/environment';

interface ClerkAuthProps {
  mode?: 'sign-in' | 'sign-up';
}

// Production-ready appearance configuration with enhanced security
const authAppearance = {
  elements: {
    rootBox: "w-full",
    card: "w-full shadow-none border-none",
    headerTitle: "text-2xl font-bold",
    headerSubtitle: "text-gray-600",
    socialButtonsBlockButton: "w-full justify-center",
    formButtonPrimary: "w-full bg-blue-600 hover:bg-blue-700 text-white",
    formFieldInput: "w-full border border-gray-300 rounded-md px-3 py-2",
    footerActionLink: "text-blue-600 hover:text-blue-700"
  },
  variables: {
    colorPrimary: "#2563eb",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorDanger: "#ef4444",
    fontFamily: "system-ui, sans-serif"
  }
};

export const ClerkAuth: React.FC<ClerkAuthProps> = React.memo(({ mode = 'sign-in' }) => {
  // Get dynamic redirect URLs based on current environment
  const authUrls = ENV_CONFIG.clerk.getAuthUrls();
  const currentDomain = ENV_CONFIG.domains.getCurrentDomain();

  const signInProps = {
    routing: "hash" as const,
    signUpUrl: authUrls.signUpUrl,
    fallbackRedirectUrl: authUrls.fallbackRedirectUrl,
    appearance: authAppearance,
    forceRedirectUrl: `${currentDomain}/dashboard`,
  };

  const signUpProps = {
    routing: "hash" as const,
    signInUrl: authUrls.signInUrl,
    fallbackRedirectUrl: authUrls.fallbackRedirectUrl,
    appearance: authAppearance,
    forceRedirectUrl: `${currentDomain}/dashboard`,
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-0">
        {mode === 'sign-in' ? (
          <SignIn {...signInProps} />
        ) : (
          <SignUp {...signUpProps} />
        )}
      </CardContent>
    </Card>
  );
});

ClerkAuth.displayName = 'ClerkAuth';
