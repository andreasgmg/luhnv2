import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
// Note: In a distributed environment (serverless/multiple containers), this is per-instance.
const rateLimit = new Map();

export function middleware(request) {
  // We only care about CORS and Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // 1. CORS - Allow all origins
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 204, 
        headers: response.headers 
      });
    }

    // 2. Rate Limiting (Fair Use Policy)
    // 60 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const limit = 60; 
    const windowMs = 60 * 1000;

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 0, lastReset: Date.now() });
    }

    const ipData = rateLimit.get(ip);

    // Reset if window has passed
    if (Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = Date.now();
    }

    if (ipData.count >= limit) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please respect the fair use policy (60 req/min).' }), 
        { status: 429, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    ipData.count += 1;

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};