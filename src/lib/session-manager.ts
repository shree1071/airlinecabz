/**
 * Stateless HMAC-based session manager.
 *
 * Why stateless? Next.js Edge/Serverless functions are ephemeral — in-memory
 * Maps are wiped on every cold start. Storing sessions in process memory means
 * any new lambda instance rejects every existing browser token.
 *
 * Solution: HMAC-sign the session payload so the token IS the session.
 * No external store (Redis, DB) required for the MVP. If you add Redis later,
 * just swap validateSession() to do a cache lookup + signature check.
 */

import crypto from 'crypto';

export interface SessionData {
  userId: string;
  createdAt: number;
  lastActivity: number;
  absoluteExpiry: number;
  ipAddress: string;
  userAgent: string;
}

const ABSOLUTE_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_API_TOKEN;
  if (!secret) throw new Error('SESSION_SECRET env var is required');
  return secret;
}

function hmacSign(payload: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');
}

/**
 * Create a new stateless session token.
 * Token format: base64(payload) + '.' + hmac_signature
 */
export function createSession(
  _token: string, // kept for API compat, ignored; we generate our own
  userId: string,
  ipAddress: string,
  userAgent: string
): SessionData & { token: string } {
  const now = Date.now();
  const session: SessionData = {
    userId,
    createdAt: now,
    lastActivity: now,
    absoluteExpiry: now + ABSOLUTE_TIMEOUT,
    ipAddress,
    userAgent,
  };

  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const sig = hmacSign(payload);
  const token = `${payload}.${sig}`;

  return { ...session, token };
}

/**
 * Validate a stateless session token.
 * Returns { valid: true, session } or { valid: false, reason }.
 */
export function validateSession(token: string): {
  valid: boolean;
  session?: SessionData;
  reason?: string;
} {
  if (!token) return { valid: false, reason: 'no_token' };

  try {
    // Also accept the raw ADMIN_API_TOKEN for simple API access from scripts
    const staticToken = process.env.ADMIN_API_TOKEN;
    if (staticToken && token === staticToken) {
      const now = Date.now();
      return {
        valid: true,
        session: {
          userId: 'admin',
          createdAt: now,
          lastActivity: now,
          absoluteExpiry: now + ABSOLUTE_TIMEOUT,
          ipAddress: 'server',
          userAgent: 'api-token',
        },
      };
    }

    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return { valid: false, reason: 'malformed_token' };

    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expectedSig = hmacSign(payload);

    // Constant-time comparison
    if (
      sig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))
    ) {
      return { valid: false, reason: 'invalid_signature' };
    }

    const session: SessionData = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );
    const now = Date.now();

    if (now > session.absoluteExpiry) {
      return { valid: false, reason: 'absolute_timeout' };
    }

    return { valid: true, session };
  } catch {
    return { valid: false, reason: 'parse_error' };
  }
}

/** Stateless tokens can't be invalidated server-side without a blocklist.
 *  For MVP, we simply confirm the operation succeeded (client will discard token). */
export function invalidateSession(_token: string): boolean {
  return true;
}

export function invalidateAllUserSessions(_userId: string): number {
  return 0;
}

export function getUserSessions(_userId: string): SessionData[] {
  return [];
}

export function getSessionStats(): {
  totalSessions: number;
  activeSessions: number;
  idleSessions: number;
} {
  return { totalSessions: 0, activeSessions: 0, idleSessions: 0 };
}

export function extendSession(_token: string): boolean {
  return true;
}

export function isSessionExpiringSoon(_token: string): boolean {
  return false;
}

export function getSessionTimeRemaining(_token: string): {
  absoluteRemaining: number;
  idleRemaining: number;
} | null {
  return null;
}
