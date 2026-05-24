// Advanced Session Management with Idle Timeout
// Implements both absolute and idle timeout for enhanced security

import { logger } from './logger';

export interface SessionData {
  userId: string;
  createdAt: number;
  lastActivity: number;
  absoluteExpiry: number;
  ipAddress: string;
  userAgent: string;
}

// Session configuration
const ABSOLUTE_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
const SESSION_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh if activity within 5 minutes

// In-memory session store (use Redis in production)
const sessions = new Map<string, SessionData>();

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [token, session] of sessions.entries()) {
    // Remove if absolute timeout reached
    if (now > session.absoluteExpiry) {
      sessions.delete(token);
      cleanedCount++;
      logger.log({
        level: 'INFO' as any,
        message: 'Session expired (absolute timeout)',
        metadata: { userId: session.userId, reason: 'absolute_timeout' }
      });
      continue;
    }
    
    // Remove if idle timeout reached
    if (now - session.lastActivity > IDLE_TIMEOUT) {
      sessions.delete(token);
      cleanedCount++;
      logger.log({
        level: 'INFO' as any,
        message: 'Session expired (idle timeout)',
        metadata: { userId: session.userId, reason: 'idle_timeout' }
      });
    }
  }
  
  if (cleanedCount > 0) {
    logger.log({
      level: 'INFO' as any,
      message: `Cleaned ${cleanedCount} expired sessions`
    });
  }
}, 60000); // Clean every minute

/**
 * Create new session
 */
export function createSession(
  token: string,
  userId: string,
  ipAddress: string,
  userAgent: string
): SessionData {
  const now = Date.now();
  
  const sessionData: SessionData = {
    userId,
    createdAt: now,
    lastActivity: now,
    absoluteExpiry: now + ABSOLUTE_TIMEOUT,
    ipAddress,
    userAgent
  };
  
  sessions.set(token, sessionData);
  
  logger.log({
    level: 'AUDIT' as any,
    message: 'Session created',
    userId,
    ip: ipAddress,
    metadata: {
      token: token.substring(0, 8) + '...',
      absoluteExpiry: new Date(sessionData.absoluteExpiry).toISOString()
    }
  });
  
  return sessionData;
}

/**
 * Validate and refresh session
 */
export function validateSession(token: string): {
  valid: boolean;
  session?: SessionData;
  reason?: string;
} {
  const session = sessions.get(token);
  
  if (!session) {
    return { valid: false, reason: 'session_not_found' };
  }
  
  const now = Date.now();
  
  // Check absolute timeout
  if (now > session.absoluteExpiry) {
    sessions.delete(token);
    logger.log({
      level: 'INFO' as any,
      message: 'Session validation failed: absolute timeout',
      userId: session.userId
    });
    return { valid: false, reason: 'absolute_timeout' };
  }
  
  // Check idle timeout
  const idleTime = now - session.lastActivity;
  if (idleTime > IDLE_TIMEOUT) {
    sessions.delete(token);
    logger.log({
      level: 'INFO' as any,
      message: 'Session validation failed: idle timeout',
      userId: session.userId,
      metadata: { idleMinutes: Math.round(idleTime / 60000) }
    });
    return { valid: false, reason: 'idle_timeout' };
  }
  
  // Update last activity if threshold passed
  if (idleTime > SESSION_REFRESH_THRESHOLD) {
    session.lastActivity = now;
    logger.log({
      level: 'INFO' as any,
      message: 'Session activity refreshed',
      userId: session.userId
    });
  }
  
  return { valid: true, session };
}

/**
 * Invalidate session (logout)
 */
export function invalidateSession(token: string): boolean {
  const session = sessions.get(token);
  
  if (!session) {
    return false;
  }
  
  sessions.delete(token);
  
  logger.log({
    level: 'AUDIT' as any,
    message: 'Session invalidated',
    userId: session.userId
  });
  
  return true;
}

/**
 * Invalidate all sessions for a user
 */
export function invalidateAllUserSessions(userId: string): number {
  let count = 0;
  
  for (const [token, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(token);
      count++;
    }
  }
  
  if (count > 0) {
    logger.log({
      level: 'AUDIT' as any,
      message: `Invalidated ${count} sessions for user`,
      userId
    });
  }
  
  return count;
}

/**
 * Get active sessions for a user
 */
export function getUserSessions(userId: string): SessionData[] {
  const userSessions: SessionData[] = [];
  
  for (const session of sessions.values()) {
    if (session.userId === userId) {
      userSessions.push(session);
    }
  }
  
  return userSessions;
}

/**
 * Get session statistics
 */
export function getSessionStats(): {
  totalSessions: number;
  activeSessions: number;
  idleSessions: number;
} {
  const now = Date.now();
  let activeSessions = 0;
  let idleSessions = 0;
  
  for (const session of sessions.values()) {
    const idleTime = now - session.lastActivity;
    
    if (idleTime < 5 * 60 * 1000) { // Active if activity within 5 minutes
      activeSessions++;
    } else {
      idleSessions++;
    }
  }
  
  return {
    totalSessions: sessions.size,
    activeSessions,
    idleSessions
  };
}

/**
 * Extend session (for "remember me" functionality)
 */
export function extendSession(token: string, additionalTime: number = ABSOLUTE_TIMEOUT): boolean {
  const session = sessions.get(token);
  
  if (!session) {
    return false;
  }
  
  session.absoluteExpiry = Date.now() + additionalTime;
  
  logger.log({
    level: 'INFO' as any,
    message: 'Session extended',
    userId: session.userId,
    metadata: {
      newExpiry: new Date(session.absoluteExpiry).toISOString()
    }
  });
  
  return true;
}

/**
 * Check if session is about to expire
 */
export function isSessionExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  const session = sessions.get(token);
  
  if (!session) {
    return false;
  }
  
  const now = Date.now();
  const timeUntilExpiry = session.absoluteExpiry - now;
  const idleTimeRemaining = IDLE_TIMEOUT - (now - session.lastActivity);
  
  const threshold = thresholdMinutes * 60 * 1000;
  
  return timeUntilExpiry < threshold || idleTimeRemaining < threshold;
}

/**
 * Get session time remaining
 */
export function getSessionTimeRemaining(token: string): {
  absoluteRemaining: number;
  idleRemaining: number;
} | null {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }
  
  const now = Date.now();
  
  return {
    absoluteRemaining: Math.max(0, session.absoluteExpiry - now),
    idleRemaining: Math.max(0, IDLE_TIMEOUT - (now - session.lastActivity))
  };
}
