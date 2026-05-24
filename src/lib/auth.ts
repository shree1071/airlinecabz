import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Secure password hashing (in production, use bcrypt or argon2)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify admin authentication from request
export function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.replace('Bearer ', '');
  
  // In production, verify token against database/Redis
  // For now, we'll use a simple check
  const expectedToken = process.env.ADMIN_API_TOKEN;
  
  return token === expectedToken;
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

// Validate UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// SQL injection prevention - validate and sanitize
export function sanitizeSQLInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove SQL keywords and special characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .trim()
    .slice(0, 500);
}

// CSRF token generation and validation
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Clean up expired tokens
  for (const [id, data] of csrfTokens.entries()) {
    if (Date.now() > data.expires) {
      csrfTokens.delete(id);
    }
  }
  
  return token;
}

export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

// Secure random string generation
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Input validation for booking data
export interface BookingInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  total_amount: number;
}

export function validateBookingInput(input: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate customer name
  if (!input.customer_name || typeof input.customer_name !== 'string') {
    errors.push('Invalid customer name');
  } else if (input.customer_name.length < 2 || input.customer_name.length > 100) {
    errors.push('Customer name must be between 2 and 100 characters');
  }

  // Validate email
  if (!input.customer_email || !isValidEmail(input.customer_email)) {
    errors.push('Invalid email address');
  }

  // Validate phone
  if (!input.customer_phone || !isValidPhone(input.customer_phone)) {
    errors.push('Invalid phone number');
  }

  // Validate locations
  if (!input.pickup_location || typeof input.pickup_location !== 'string' || input.pickup_location.length < 3) {
    errors.push('Invalid pickup location');
  }
  if (!input.dropoff_location || typeof input.dropoff_location !== 'string' || input.dropoff_location.length < 3) {
    errors.push('Invalid dropoff location');
  }

  // Validate date
  try {
    const date = new Date(input.pickup_date);
    if (isNaN(date.getTime()) || date < new Date()) {
      errors.push('Invalid pickup date - must be in the future');
    }
  } catch {
    errors.push('Invalid date format');
  }

  // Validate vehicle type
  if (!input.vehicle_type || typeof input.vehicle_type !== 'string') {
    errors.push('Invalid vehicle type');
  }

  // Validate amount
  if (typeof input.total_amount !== 'number' || input.total_amount < 0 || input.total_amount > 1000000) {
    errors.push('Invalid total amount');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
