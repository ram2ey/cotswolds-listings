import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient, isSupabaseConfigured } from './supabase/server';

export interface AdminUser {
  id: string;
  email: string | null;
}

// Authorization check beyond "is a valid Supabase Auth user": Supabase Auth's
// signup endpoint is reachable by anyone with the public anon key, so being
// authenticated is not enough — the account must also be explicitly listed in
// admin_users (populated manually via the Supabase dashboard/SQL editor, never
// through this app). This table has no RLS policies, so only the service-role
// key below can read it.
async function isApprovedAdmin(userId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;

  const admin = createClient(supabaseUrl, serviceKey);
  const { data } = await admin
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  return data !== null;
}

/**
 * Returns the current admin user if the request has a valid, approved
 * Supabase Auth session. Must be called from within a Route Handler.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  // getUser() verifies the token against Supabase's auth server rather than
  // just decoding the cookie locally, so a tampered/expired cookie can't pass.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const approved = await isApprovedAdmin(user.id);
  if (!approved) return null;

  return { id: user.id, email: user.email ?? null };
}

export async function verifyAdminSession(): Promise<boolean> {
  const user = await getAdminUser();
  return user !== null;
}
