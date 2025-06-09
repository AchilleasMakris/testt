
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
  isProduction: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Environment detection
const isProduction = import.meta.env.PROD;

// Enhanced security utility functions
const sanitizeString = (input: string | null | undefined, maxLength: number = 50): string | null => {
  if (!input) return null;
  // Remove potential XSS characters and limit length
  const sanitized = input.replace(/[<>'"&]/g, '').substring(0, maxLength);
  return sanitized || null;
};

const logSecurityEvent = async (eventType: string, userId: string, details: any = {}) => {
  try {
    // Enhanced logging for production
    const logData = {
      event_type: eventType,
      user_id: userId,
      details: {
        ...details,
        environment: isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        origin: window.location.origin
      }
    };

    // Use service role for security logging
    await supabase.rpc('log_security_event', logData);
  } catch (error) {
    // Silent fail for logging to prevent blocking user operations
  }
};

const validateUserData = (user: any): boolean => {
  if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
    return false;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.primaryEmailAddress.emailAddress)) {
    return false;
  }

  // Validate user ID format
  if (user.id.length < 10) {
    return false;
  }

  // Validate email domain
  const email = user.primaryEmailAddress.emailAddress;
  if (email.length > 254) { // RFC 5321 limit
    return false;
  }

  return true;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut, getToken } = useClerkAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // JWT validation
  const validateJWT = async () => {
    if (user) {
      try {
        const token = await getToken();
        if (!token) {
          await logSecurityEvent('jwt_validation_failed', user.id, {
            reason: 'No JWT token available'
          });
          return false;
        }

        // Additional JWT validation can be added here
        return true;
      } catch (error) {
        await logSecurityEvent('jwt_validation_error', user?.id || 'unknown', {
          error: error instanceof Error ? error.message : 'Unknown JWT error'
        });
        return false;
      }
    }
    return true;
  };

  // Create or update user profile in Supabase when user signs in
  useEffect(() => {
    const createOrUpdateProfile = async () => {
      if (user && isLoaded && !isProcessing) {
        setIsProcessing(true);
        
        try {
          // Validate JWT if in production
          if (isProduction) {
            const isJWTValid = await validateJWT();
            if (!isJWTValid) {
              console.error('JWT validation failed');
              return;
            }
          }

          // Enhanced validation
          if (!validateUserData(user)) {
            await logSecurityEvent('invalid_user_data', user?.id || 'unknown', {
              reason: 'Invalid user data from Clerk',
              environment: isProduction ? 'production' : 'development'
            });
            console.error('Invalid user data from Clerk');
            return;
          }

          // Sanitize user input with stricter validation
          const sanitizedFirstName = sanitizeString(user.firstName, 50);
          const sanitizedLastName = sanitizeString(user.lastName, 50);
          const email = user.primaryEmailAddress.emailAddress;

          // Additional email validation
          if (email.length > 254) { // RFC 5321 limit
            await logSecurityEvent('invalid_email_length', user.id, { 
              email_length: email.length,
              environment: isProduction ? 'production' : 'development'
            });
            console.error('Email too long');
            return;
          }

          // Check if profile exists with proper error handling
          const { data: existingProfile, error: selectError } = await supabase
            .from('profiles')
            .select('id, created_at')
            .eq('id', user.id)
            .maybeSingle();

          if (selectError) {
            await logSecurityEvent('profile_lookup_failed', user.id, {
              error: selectError.message,
              environment: isProduction ? 'production' : 'development'
            });
            console.error('Profile lookup failed:', selectError.message);
            return;
          }

          if (!existingProfile) {
            // Create new profile with enhanced validation
            const { error } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: email,
                first_name: sanitizedFirstName,
                last_name: sanitizedLastName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (error) {
              await logSecurityEvent('profile_creation_failed', user.id, {
                error: error.message,
                email: email,
                environment: isProduction ? 'production' : 'development'
              });
              console.error('Profile creation failed:', error.message);
            } else {
              await logSecurityEvent('profile_created', user.id, {
                email: email,
                has_first_name: !!sanitizedFirstName,
                has_last_name: !!sanitizedLastName,
                environment: isProduction ? 'production' : 'development'
              });
            }
          } else {
            // Log successful login for existing user
            await logSecurityEvent('user_login', user.id, {
              email: email,
              existing_profile: true,
              environment: isProduction ? 'production' : 'development'
            });
          }
        } catch (error) {
          await logSecurityEvent('auth_process_error', user?.id || 'unknown', {
            error: error instanceof Error ? error.message : 'Unknown error',
            environment: isProduction ? 'production' : 'development'
          });
          console.error('Authentication process error:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    createOrUpdateProfile();
  }, [user, isLoaded, isProcessing]);

  const signOut = async () => {
    try {
      if (user?.id) {
        await logSecurityEvent('user_logout', user.id, {
          timestamp: new Date().toISOString(),
          environment: isProduction ? 'production' : 'development'
        });
      }
      await clerkSignOut();
    } catch (error) {
      await logSecurityEvent('logout_failed', user?.id || 'unknown', {
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: isProduction ? 'production' : 'development'
      });
      console.error('Sign out failed:', error);
      throw new Error('Sign out failed. Please try again.');
    }
  };

  const value = {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      created_at: user.createdAt,
      firstName: user.firstName,
      lastName: user.lastName
    } : null,
    session: user ? { user } : null,
    loading: !isLoaded,
    signOut,
    isProduction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
