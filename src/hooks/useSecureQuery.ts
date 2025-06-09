
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { logDataAccess, logSecurityViolation } from '@/components/security/SecurityLogger';

interface SecureQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  tableName?: string;
  operation?: 'create' | 'read' | 'update' | 'delete';
  requireAuth?: boolean;
}

export const useSecureQuery = <T>({
  queryFn,
  tableName = 'unknown',
  operation = 'read',
  requireAuth = true,
  ...options
}: SecureQueryOptions<T>) => {
  const { user } = useAuth();

  const secureQueryFn = async (): Promise<T> => {
    // Check authentication if required
    if (requireAuth && !user) {
      logSecurityViolation('unauthorized_access', 'anonymous', {
        tableName,
        operation,
        queryKey: options.queryKey
      });
      throw new Error('Authentication required');
    }

    try {
      // Log data access
      if (user) {
        logDataAccess(tableName, operation, user.id, {
          queryKey: options.queryKey
        });
      }

      const result = await queryFn();
      return result;
    } catch (error) {
      // Log query failures
      if (user) {
        logSecurityViolation('query_failure', user.id, {
          tableName,
          operation,
          error: error instanceof Error ? error.message : 'Unknown error',
          queryKey: options.queryKey
        });
      }
      throw error;
    }
  };

  return useQuery({
    ...options,
    queryFn: secureQueryFn,
    enabled: requireAuth ? !!user && (options.enabled ?? true) : (options.enabled ?? true)
  });
};
