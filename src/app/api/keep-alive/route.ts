import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Optional secret verification if CRON_SECRET is set in environment
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const authQuery = request.nextUrl.searchParams.get('secret');
      if (authQuery !== cronSecret) {
        return NextResponse.json(
          { error: 'Unauthorized keep-alive request' },
          { status: 401 }
        );
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-supabase-url-here')) {
      return NextResponse.json({
        success: false,
        message: 'Supabase credentials not configured or placeholder used',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const startTime = Date.now();
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Perform a lightweight query on the businesses table to keep the database active
    const { data, count, error } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true });

    const durationMs = Date.now() - startTime;

    if (error) {
      console.error('Keep-alive query error:', error.message);
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        durationMs
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase database pinged successfully to prevent 7-day idle pause',
      recordCount: count ?? 0,
      timestamp: new Date().toISOString(),
      durationMs
    });
  } catch (err: any) {
    console.error('Unhandled keep-alive error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
