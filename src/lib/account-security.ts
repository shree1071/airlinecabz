// Account Security - Lockout and MFA functionality

import { logger } from '@/lib/logger';

// Account lockout configuration
const LOCKOUT_THRESHOLD = 5; // Failed attempts before lockout
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes window for counting attempts

// In-memory store (use Redis in production)
interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts.entries()) {
    // Remove if window expired and not locked
    if (!attempt.lockedUntil && now - attempt.firstAttempt > ATTEMPT_WINDOW) {
      loginAttempts.delete(key);
    }
    // Remove if lockout expired
    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      loginAttempts.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Check if account is locked
 */
export function isAccountLocked(identifier: string): boolean {
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt || !attempt.lockedUntil) {
    return false;
  }
  
  const now = Date.now();
  
  // Check if lockout period has expired
  if (now > attempt.lockedUntil) {
    loginAttempts.delete(identifier);
    return false;
  }
  
  return true;
}

/**
 * Get remaining lockout time in seconds
 */
export function getLockoutTimeRemaining(identifier: string): number {
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt || !attempt.lockedUntil) {
    return 0;
  }
  
  const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Record failed login attempt
 */
export function recordFailedLogin(identifier: string, ip: string): {
  locked: boolean;
  attemptsRemaining: number;
  lockoutTime?: number;
} {
  const now = Date.now();
  let attempt = loginAttempts.get(identifier);
  
  if (!attempt) {
    // First failed attempt
    attempt = {
      count: 1,
      firstAttempt: now
    };
    loginAttempts.set(identifier, attempt);
    
    logger.logSecurityEvent('Failed login attempt', ip, {
      identifier,
      attempt: 1,
      threshold: LOCKOUT_THRESHOLD
    });
    
    return {
      locked: false,
      attemptsRemaining: LOCKOUT_THRESHOLD - 1
    };
  }
  
  // Check if we're in a new window
  if (now - attempt.firstAttempt > ATTEMPT_WINDOW) {
    // Reset counter for new window
    attempt.count = 1;
    attempt.firstAttempt = now;
    delete attempt.lockedUntil;
    
    return {
      locked: false,
      attemptsRemaining: LOCKOUT_THRESHOLD - 1
    };
  }
  
  // Increment counter
  attempt.count++;
  
  // Check if threshold reached
  if (attempt.count >= LOCKOUT_THRESHOLD) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    
    logger.logSecurityEvent('Account locked due to failed login attempts', ip, {
      identifier,
      attempts: attempt.count,
      lockedUntil: new Date(attempt.lockedUntil).toISOString()
    });
    
    return {
      locked: true,
      attemptsRemaining: 0,
      lockoutTime: LOCKOUT_DURATION / 1000
    };
  }
  
  logger.logSecurityEvent('Failed login attempt', ip, {
    identifier,
    attempt: attempt.count,
    threshold: LOCKOUT_THRESHOLD
  });
  
  return {
    locked: false,
    attemptsRemaining: LOCKOUT_THRESHOLD - attempt.count
  };
}

/**
 * Clear failed login attempts (on successful login)
 */
export function clearFailedLogins(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Get failed login attempt count
 */
export function getFailedLoginCount(identifier: string): number {
  const attempt = loginAttempts.get(identifier);
  return attempt?.count || 0;
}

// ============================================
// MFA (Multi-Factor Authentication) Support
// ============================================

interface MFASecret {
  secret: string;
  backupCodes: string[];
  enabled: boolean;
  createdAt: number;
}

// In-memory MFA store (use database in production)
const mfaSecrets = new Map<string, MFASecret>();

/**
 * Generate MFA secret for user
 */
export function generateMFASecret(userId: string): {
  secret: string;
  backupCodes: string[];
  qrCodeUrl: string;
} {
  const crypto = require('crypto');
  
  // Generate base32 secret (compatible with Google Authenticator)
  const secret = crypto.randomBytes(20).toString('base64')
    .replace(/\+/g, '0')
    .replace(/\//g, '1')
    .substring(0, 32);
  
  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  
  // Store secret (disabled by default until user confirms)
  mfaSecrets.set(userId, {
    secret,
    backupCodes,
    enabled: false,
    createdAt: Date.now()
  });
  
  // Generate QR code URL for authenticator apps
  const appName = 'Airlinecabz';
  const qrCodeUrl = `otpauth://totp/${appName}:${userId}?secret=${secret}&issuer=${appName}`;
  
  return {
    secret,
    backupCodes,
    qrCodeUrl
  };
}

/**
 * Enable MFA for user (after they verify the code)
 */
export function enableMFA(userId: string): boolean {
  const mfa = mfaSecrets.get(userId);
  
  if (!mfa) {
    return false;
  }
  
  mfa.enabled = true;
  logger.logSecurityEvent('MFA enabled', 'system', { userId });
  
  return true;
}

/**
 * Disable MFA for user
 */
export function disableMFA(userId: string): void {
  mfaSecrets.delete(userId);
  logger.logSecurityEvent('MFA disabled', 'system', { userId });
}

/**
 * Check if MFA is enabled for user
 */
export function isMFAEnabled(userId: string): boolean {
  const mfa = mfaSecrets.get(userId);
  return mfa?.enabled || false;
}

/**
 * Verify TOTP code (Time-based One-Time Password)
 * Note: In production, use a library like 'otplib' for proper TOTP verification
 */
export function verifyTOTP(userId: string, code: string): boolean {
  const mfa = mfaSecrets.get(userId);
  
  if (!mfa || !mfa.enabled) {
    return false;
  }
  
  // TODO: Implement proper TOTP verification using otplib
  // This is a placeholder - DO NOT use in production
  // Install: npm install otplib
  // import { authenticator } from 'otplib';
  // return authenticator.verify({ token: code, secret: mfa.secret });
  
  logger.logSecurityEvent('TOTP verification attempted', 'system', { userId });
  
  // Placeholder return - replace with actual TOTP verification
  return false;
}

/**
 * Verify backup code
 */
export function verifyBackupCode(userId: string, code: string): boolean {
  const mfa = mfaSecrets.get(userId);
  
  if (!mfa || !mfa.enabled) {
    return false;
  }
  
  const codeIndex = mfa.backupCodes.indexOf(code.toUpperCase());
  
  if (codeIndex === -1) {
    return false;
  }
  
  // Remove used backup code
  mfa.backupCodes.splice(codeIndex, 1);
  
  logger.logSecurityEvent('Backup code used', 'system', {
    userId,
    remainingCodes: mfa.backupCodes.length
  });
  
  return true;
}

/**
 * Get remaining backup codes count
 */
export function getRemainingBackupCodes(userId: string): number {
  const mfa = mfaSecrets.get(userId);
  return mfa?.backupCodes.length || 0;
}

// ============================================
// Password Policy Enforcement
// ============================================

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommon: boolean;
}

const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommon: true
};

// Common passwords to block
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'monkey', '1234567', 'letmein', 'trustno1',
  'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  'admin', 'admin123', 'root', 'toor', 'pass'
];

/**
 * Validate password against policy
 */
export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check minimum length
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }
  
  // Check uppercase
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check lowercase
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check numbers
  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check special characters
  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check against common passwords
  if (policy.preventCommon && COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;
  
  // Length bonus
  strength += Math.min(password.length * 4, 40);
  
  // Character variety bonus
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 10;
  if (/\d/.test(password)) strength += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
  
  // Complexity bonus
  const uniqueChars = new Set(password).size;
  strength += Math.min(uniqueChars * 2, 15);
  
  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) strength -= 10; // Repeated characters
  if (/^[0-9]+$/.test(password)) strength -= 20; // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) strength -= 10; // Only letters
  
  return Math.max(0, Math.min(100, strength));
}
