import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Supabase client bound to Next.js cookies, for use inside Route Handlers only
// (the cookie adapter's `set` calls require a mutable cookie jar, which Server
// Components don't have). Persists/refreshes the auth session automatically.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored: happens if called outside a Route Handler/Server Action context.
          }
        },
      },
    }
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && !url.includes('your-supabase-url-here'));
}
