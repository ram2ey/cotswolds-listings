import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  // Support reverse proxies (like Vercel/Hostinger setups) which forward headers
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';

  // Determine environment
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isAdminSubdomain = hostname.startsWith('admin.');

  // 1. Subdomain matching: Rewrite root requests on admin subdomain to the dashboard
  if (isAdminSubdomain) {
    if (url.pathname === '/') {
      url.pathname = '/admin/dashboard';
      return NextResponse.rewrite(url);
    }
  }

  // 2. Main domain access protection:
  // Commented out to allow direct access to /admin on the main domain
  /*
  if (!isAdminSubdomain && url.pathname.startsWith('/admin')) {
    if (!isLocalhost) {
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }
  */

  return NextResponse.next();
}

// Config to specify matching request paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - hero-bridge.jpg (public asset cover background)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|hero-bridge.jpg).*)',
  ],
};
