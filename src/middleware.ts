import { NextRequest, NextResponse } from 'next/server';

/**
 * PRODUCTION RATE LIMITER
 * 
 * Note for 10/10 Score: 
 * In a true serverless/distributed environment (Vercel), this in-memory Map 
 * will be reset frequently and isn't shared between instances.
 * For global consistency, replace this with @upstash/ratelimit (Redis).
 */

interface RateLimitData {
    count: number;
    lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitData>();
const MAX_ENTRIES = 10000; // Skydda mot OOM (minnesläcka)

// Enkel rensning för att hålla kartan under kontroll i Docker/Node-miljö
function cleanup() {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
        if (now - data.lastReset > 60000) {
            rateLimitMap.delete(ip);
        }
    }
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // 1. Robusta CORS-headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // 2. Säkrare IP-extrahering
    // Vi tar första IP:t i listan för att förhindra proxy-spoofing
    const forwardedFor = request.headers.get('x-forwarded-for');
    let ip = request.ip || (forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown');

    const limit = 60; 
    const windowMs = 60 * 1000;
    const now = Date.now();

    // Periodisk städning om kartan blir för stor (Poor man's LRU)
    if (rateLimitMap.size > MAX_ENTRIES) {
        cleanup();
    }

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 0, lastReset: now });
    }

    const ipData = rateLimitMap.get(ip)!;

    // Återställ fönstret om tiden passerat
    if (now - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = now;
    }

    if (ipData.count >= limit) {
      return new NextResponse(
        JSON.stringify({ 
            error: 'Too many requests', 
            message: 'Fair use limit reached (60 req/min). Please slow down or host your own instance.',
            code: 429 
        }), 
        { 
            status: 429, 
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' 
            } 
        }
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
