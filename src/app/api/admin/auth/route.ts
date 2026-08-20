import { NextRequest, NextResponse } from 'next/server';
import { 
  ADMIN_COOKIE_NAME, 
  createAdminSessionToken, 
  verifyAdminSession 
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// GET: Check current authentication status
export async function GET(request: NextRequest) {
  const isAuthenticated = verifyAdminSession(request);
  return NextResponse.json({ authenticated: isAuthenticated });
}

// POST: Log in with admin password and set HTTP-only cookie
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cotswoldsadmin';

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Incorrect administrator credentials. Access denied.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Admin session initialized.'
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

// DELETE: Log out and clear session cookie
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin session terminated successfully.'
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
