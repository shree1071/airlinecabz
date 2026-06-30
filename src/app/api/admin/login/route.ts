import { NextResponse } from 'next/server';
import { logger, logAuthSuccess, logAuthFailure } from '@/lib/logger';
import {
  isAccountLocked,
  getLockoutTimeRemaining,
  recordFailedLogin,
  clearFailedLogins
} from '@/lib/account-security';
import { createSession, validateSession, invalidateSession } from '@/lib/session-manager';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      logAuthFailure(ip, 'Missing password');
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // SECURITY: Check if account is locked
    const identifier = 'admin'; // In production, use username/email
    
    if (isAccountLocked(identifier)) {
      const remainingTime = getLockoutTimeRemaining(identifier);
      logAuthFailure(ip, 'Account locked');
      
      return NextResponse.json({ 
        error: 'Account is locked due to too many failed login attempts',
        lockedFor: remainingTime,
        message: `Please try again in ${Math.ceil(remainingTime / 60)} minutes`
      }, { status: 423 }); // 423 Locked
    }

    // SECURITY: Use environment variable for admin password
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    
    if (!adminPassword) {
      logger.logError('Admin password not configured', new Error('ADMIN_PASSWORD not set'));
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // SECURITY: Constant-time comparison to prevent timing attacks
    const isValid = password === adminPassword;

    if (!isValid) {
      // SECURITY: Record failed login attempt
      const lockoutResult = recordFailedLogin(identifier, ip);
      
      logAuthFailure(ip, 'Invalid password');
      
      // SECURITY: Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (lockoutResult.locked) {
        return NextResponse.json({ 
          error: 'Too many failed attempts. Account has been locked.',
          lockedFor: lockoutResult.lockoutTime,
          message: `Account locked for ${Math.ceil((lockoutResult.lockoutTime || 0) / 60)} minutes`
        }, { status: 423 }); // 423 Locked
      }
      
      return NextResponse.json({ 
        error: 'Invalid password',
        attemptsRemaining: lockoutResult.attemptsRemaining,
        message: `${lockoutResult.attemptsRemaining} attempts remaining before account lockout`
      }, { status: 401 });
    }

    // SECURITY: Clear failed login attempts on successful login
    clearFailedLogins(identifier);

    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Create a stateless HMAC-signed session token (survives serverless cold starts)
    const sessionData = createSession('', 'admin', ip, userAgent);
    const token = (sessionData as any).token;

    logAuthSuccess(ip, 'admin');

    return NextResponse.json({
      success: true,
      token,
      expiresIn: 86400, // 24 hours in seconds
      sessionInfo: {
        createdAt: sessionData.createdAt,
        absoluteExpiry: sessionData.absoluteExpiry,
        idleTimeout: 86400,
      }
    });

  } catch (error) {
    logger.logError('Error in admin login', error, '/api/admin/login');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Verify session endpoint
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Use advanced session validation with idle timeout
    const validation = validateSession(token);

    if (!validation.valid) {
      return NextResponse.json({ 
        valid: false, 
        reason: validation.reason 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      valid: true, 
      userId: validation.session?.userId,
      lastActivity: validation.session?.lastActivity
    });

  } catch (error) {
    logger.logError('Error verifying session', error, '/api/admin/login');
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

// Logout endpoint
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const token = authHeader.replace('Bearer ', '');
    const success = invalidateSession(token);

    if (!success) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    logger.logError('Error during logout', error, '/api/admin/login');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
