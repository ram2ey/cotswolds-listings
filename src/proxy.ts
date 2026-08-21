import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Not nonce-based: several routes in this app (admin dashboard, service pages,
// etc.) are client components that Next.js prerenders as static HTML at build
// time, so a fresh per-request nonce can never match what's baked into that
// HTML — confirmed by CSP blocking every script on those pages when tested.
const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://images.unsplash.com https://*.supabase.co;
  font-src 'self';
  connect-src 'self' https://*.supabase.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

export function proxy(request: NextRequest) {
  // Support reverse proxies (Vercel/Hostinger setups) which forward headers
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const isAdminSubdomain = hostname.startsWith('admin.');

  let response: NextResponse;

  // Subdomain matching: rewrite root requests on the admin subdomain to the dashboard
  if (isAdminSubdomain && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  response.headers.set('Content-Security-Policy', CSP_HEADER);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
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
