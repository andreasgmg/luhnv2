import { NextResponse } from 'next/server';

export function middleware(request) {
  // We only care about CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // Allow all origins (standard for public APIs)
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

    return response;
  }

  return NextResponse.next();
}

// Ensure middleware only runs on API routes for performance
export const config = {
  matcher: '/api/:path*',
};
