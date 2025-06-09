
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClerkAuth } from '@/components/auth/ClerkAuth';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Determine auth mode based on URL path or search params
  const getAuthMode = (): 'sign-in' | 'sign-up' => {
    const pathname = window.location.pathname;
    const mode = searchParams.get('mode');
    
    if (pathname.includes('sign-up') || mode === 'sign-up') {
      return 'sign-up';
    }
    return 'sign-in';
  };

  const authMode = getAuthMode();

  return (
    <BackgroundBeamsWithCollision className="min-h-screen">
      <div className="relative z-20">
        <ClerkAuth mode={authMode} />
      </div>
    </BackgroundBeamsWithCollision>
  );
};

export default Auth;
