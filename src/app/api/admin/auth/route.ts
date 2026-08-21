import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET: Check current authentication status
export async function GET() {
  const isAuthenticated = await verifyAdminSession();
  return NextResponse.json({ authenticated: isAuthenticated });
}

// POST: Log in with Supabase Auth email/password
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      console.error('[admin-auth] Supabase is not configured. Refusing all admin logins.');
      return NextResponse.json(
        { error: 'Administrator access is not configured on this deployment.' },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin-login:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.retryAfterMs / 1000)) } }
      );
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Incorrect administrator credentials. Access denied.' },
        { status: 401 }
      );
    }

    // Being a valid Supabase Auth user isn't sufficient authorization on its
    // own — the account must also be listed in admin_users.
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'This account is not authorized for administrator access.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful. Admin session initialized.'
    });
  } catch (err) {
    return errorResponse(err, 500, 'Authentication error', 'admin-auth');
  }
}

// DELETE: Log out and clear session
export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[admin-auth] Logout error:', err);
  }

  return NextResponse.json({
    success: true,
    message: 'Admin session terminated successfully.'
  });
}
