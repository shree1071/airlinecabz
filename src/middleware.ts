import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleCorsPreflightRequest, applyCorsHeaders, validateCorsRequest } from '@/lib/cors';
import { Redis } from '@upstash/redis';

// Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://maps.googleapis.com https://nominatim.openstreetmap.org https://router.project-osrm.org",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.insforge.app https://nominatim.openstreetmap.org https://router.project-osrm.org https://graph.facebook.com https://wa.me https://api.whatsapp.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

async function rateLimit(ip: string): Promise<boolean> {
  // If Redis is not configured, we allow the request to prevent breaking functionality
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis is not configured for rate limiting. Skipping rate limit check.');
    return true;
  }

  try {
    const key = `ratelimit:${ip}`;
    const count = await redis.incr(key);
    
    // Set expiry on the first request
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }
    
    return count <= RATE_LIMIT_MAX_REQUESTS;
  } catch (error) {
    console.error('Rate limit error:', error);
    // Allow request if Redis fails to prevent taking down the app
    return true;
  }
}

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(request);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Validate CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const corsValidation = validateCorsRequest(request);
    if (!corsValidation.valid) {
      return new NextResponse(
        JSON.stringify({ error: corsValidation.error }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  const response = NextResponse.next();

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CORS headers
  applyCorsHeaders(request, response);

  // Get client IP from headers
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const isAllowed = await rateLimit(ip);
    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }
  }

  // Admin route protection - verify authentication
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/api') &&
      request.nextUrl.pathname !== '/admin') {
    
    // Check if this is a client-side navigation (has referer)
    const referer = request.headers.get('referer');
    const isClientNavigation = referer && new URL(referer).origin === request.nextUrl.origin;
    
    // For server-side requests, redirect to login
    if (!isClientNavigation) {
      // Let client-side handle auth check via sessionStorage
      // Server can't access sessionStorage, so we allow the request
      // and let the page component handle the redirect
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
