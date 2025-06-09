
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  eventType: string;
  userId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  private events: SecurityEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Flush events every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000);
  }

  public static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  public log(event: SecurityEvent): void {
    // Add timestamp and browser info
    const enhancedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: event.userAgent || navigator.userAgent,
      details: {
        ...event.details,
        url: window.location.href,
        referrer: document.referrer
      }
    };

    this.events.push(enhancedEvent);

    // Immediate flush for critical events
    const criticalEvents = ['auth_failure', 'unauthorized_access', 'security_violation'];
    if (criticalEvents.includes(event.eventType)) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Batch insert security events
      for (const event of eventsToFlush) {
        await supabase.rpc('log_security_event', {
          event_type: event.eventType,
          user_id: event.userId,
          details: event.details || {}
        });
      }
    } catch (error) {
      // Re-add failed events to queue
      this.events.unshift(...eventsToFlush);
      console.warn('Failed to flush security events:', error);
    }
  }

  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }
}

// Utility functions for common security events
export const logSecurityEvent = (eventType: string, userId: string, details?: Record<string, any>) => {
  const logger = SecurityLogger.getInstance();
  logger.log({ eventType, userId, details });
};

export const logAuthEvent = (eventType: 'login' | 'logout' | 'signup' | 'auth_failure', userId: string, details?: Record<string, any>) => {
  logSecurityEvent(`auth_${eventType}`, userId, details);
};

export const logDataAccess = (table: string, operation: 'create' | 'read' | 'update' | 'delete', userId: string, details?: Record<string, any>) => {
  logSecurityEvent(`data_${operation}`, userId, { table, ...details });
};

export const logSecurityViolation = (violationType: string, userId: string, details?: Record<string, any>) => {
  logSecurityEvent('security_violation', userId, { violationType, ...details });
};
