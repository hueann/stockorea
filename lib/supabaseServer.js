import { createClient } from '@supabase/supabase-js';

export function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Authorization: Bearer <access_token> 헤더에서 사용자 확인
export async function userFromRequest(req) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await admin().auth.getUser(token);
  if (error) return null;
  return data?.user || null;
}

export async function isAdminUser(userId) {
  const { data } = await admin().from('profiles').select('role').eq('id', userId).single();
  return data?.role === 'admin';
}
