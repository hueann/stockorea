import { createClient } from '@supabase/supabase-js';
import HomeClient from './HomeClient';

export const revalidate = 600; // 10분마다 재생성 (새 콘텐츠 반영)

async function getAssets() {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = await db.from('assets').select('*').eq('status', 'active')
      .order('created_at', { ascending: false }).limit(40);
    return data || [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const initialAssets = await getAssets();
  return <HomeClient initialAssets={initialAssets} />;
}
