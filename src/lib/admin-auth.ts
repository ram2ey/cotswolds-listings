import { NextRequest } from 'next/server';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'cotswolds_admin_session';

function getAdminSecret(): string {
  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cotswoldsadmin';
}

function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET || getAdminSecret();
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Creates an HMAC-SHA256 signed session token containing timestamp and payload.
 */
export function createAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(`admin:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

/**
 * Validates a session token signature and checks if it is not expired (7 days max age).
 */
export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max age: 7 days in milliseconds
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(`admin:${timestampStr}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Verifies if an incoming NextRequest has valid administrative credentials
 * either via the secure HTTP-only cookie or an Authorization Bearer header.
 */
export function verifyAdminSession(request: NextRequest): boolean {
  // 1. Check HTTP-only cookie
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (cookie?.value && isValidAdminToken(cookie.value)) {
    return true;
  }

  // 2. Check Authorization Bearer header (for automated scripts or programmatic calls)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerSecret = authHeader.slice(7).trim();
    if (bearerSecret === getAdminSecret()) {
      return true;
    }
  }

  return false;
}
