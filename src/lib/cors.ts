// CORS (Cross-Origin Resource Sharing) Configuration
// Secure CORS policy implementation

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Whitelist of allowed origins
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://airlinecabz.com',
  'https://www.airlinecabz.com',
  // Add production domains here
];

// Development mode allows all localhost origins
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  // In development, allow all localhost origins
  if (isDevelopment && origin.startsWith('http://localhost')) {
    return true;
  }
  
  // Check against whitelist
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const origin = request.headers.get('origin');
  
  // Check if origin is allowed
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  return response;
}

/**
 * Handle preflight OPTIONS request
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse | null {
  // Check if this is a preflight request
  if (request.method !== 'OPTIONS') {
    return null;
  }
  
  const origin = request.headers.get('origin');
  
  // Reject if origin not allowed
  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }
  
  // Return preflight response
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

/**
 * Validate CORS request
 */
export function validateCorsRequest(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const origin = request.headers.get('origin');
  
  // No origin header means same-origin request (allowed)
  if (!origin) {
    return { valid: true };
  }
  
  // Check if origin is allowed
  if (!isOriginAllowed(origin)) {
    return {
      valid: false,
      error: 'Origin not allowed by CORS policy'
    };
  }
  
  return { valid: true };
}
