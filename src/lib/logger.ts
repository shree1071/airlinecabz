// Security logging and monitoring system

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY',
  AUDIT = 'AUDIT'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  error?: any;
  metadata?: Record<string, any>;
}

class SecurityLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    // Add to in-memory store
    this.logs.push(logEntry);
    
    // Trim if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${logEntry.level}] ${logEntry.timestamp}:`, logEntry.message, logEntry.metadata || '');
    }

    // In production, send to external logging service (e.g., Datadog, Sentry, CloudWatch)
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry);
    }

    // Alert on security events
    if (entry.level === LogLevel.SECURITY || entry.level === LogLevel.ERROR) {
      this.alertSecurityTeam(logEntry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Example: Send to Sentry, Datadog, CloudWatch, etc.
  }

  private alertSecurityTeam(entry: LogEntry): void {
    // TODO: Implement alerting mechanism
    // Example: Send email, Slack notification, PagerDuty alert
    console.error('🚨 SECURITY ALERT:', entry);
  }

  // Log authentication attempts
  logAuthAttempt(success: boolean, ip: string, userAgent: string, metadata?: Record<string, any>): void {
    this.log({
      level: success ? LogLevel.AUDIT : LogLevel.SECURITY,
      message: success ? 'Successful authentication' : 'Failed authentication attempt',
      ip,
      userAgent,
      metadata: {
        ...metadata,
        success
      }
    });
  }

  // Log API access
  logAPIAccess(method: string, endpoint: string, statusCode: number, ip: string, userId?: string): void {
    this.log({
      level: LogLevel.INFO,
      message: 'API access',
      method,
      endpoint,
      statusCode,
      ip,
      userId
    });
  }

  // Log security events
  logSecurityEvent(message: string, ip: string, metadata?: Record<string, any>): void {
    this.log({
      level: LogLevel.SECURITY,
      message,
      ip,
      metadata
    });
  }

  // Log data access
  logDataAccess(userId: string, resource: string, action: string, ip: string): void {
    this.log({
      level: LogLevel.AUDIT,
      message: `Data access: ${action} on ${resource}`,
      userId,
      ip,
      metadata: { resource, action }
    });
  }

  // Log errors
  logError(message: string, error: any, endpoint?: string, userId?: string): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      error: {
        message: error?.message,
        stack: error?.stack,
        code: error?.code
      },
      endpoint,
      userId
    });
  }

  // Get recent logs (for admin dashboard)
  getRecentLogs(limit: number = 100, level?: LogLevel): LogEntry[] {
    let filtered = this.logs;
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    
    return filtered.slice(-limit).reverse();
  }

  // Detect suspicious patterns
  detectSuspiciousActivity(ip: string, timeWindow: number = 60000): boolean {
    const now = Date.now();
    const recentLogs = this.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return log.ip === ip && (now - logTime) < timeWindow;
    });

    // Check for multiple failed auth attempts
    const failedAuths = recentLogs.filter(log => 
      log.level === LogLevel.SECURITY && 
      log.message.includes('Failed authentication')
    );

    if (failedAuths.length >= 5) {
      this.logSecurityEvent('Multiple failed authentication attempts detected', ip, {
        attempts: failedAuths.length,
        timeWindow: `${timeWindow}ms`
      });
      return true;
    }

    // Check for excessive API calls
    const apiCalls = recentLogs.filter(log => log.level === LogLevel.INFO);
    if (apiCalls.length > 100) {
      this.logSecurityEvent('Excessive API calls detected', ip, {
        calls: apiCalls.length,
        timeWindow: `${timeWindow}ms`
      });
      return true;
    }

    return false;
  }
}

// Export singleton instance
export const logger = new SecurityLogger();

// Helper functions for common logging scenarios
export function logRequest(req: Request, statusCode: number): void {
  const url = new URL(req.url);
  logger.logAPIAccess(
    req.method,
    url.pathname,
    statusCode,
    req.headers.get('x-forwarded-for') || 'unknown'
  );
}

export function logAuthFailure(ip: string, reason: string): void {
  logger.logAuthAttempt(false, ip, '', { reason });
}

export function logAuthSuccess(ip: string, userId: string): void {
  logger.logAuthAttempt(true, ip, '', { userId });
}

export function logSecurityViolation(message: string, req: Request, details?: any): void {
  logger.logSecurityEvent(
    message,
    req.headers.get('x-forwarded-for') || 'unknown',
    {
      url: req.url,
      method: req.method,
      userAgent: req.headers.get('user-agent'),
      ...details
    }
  );
}
