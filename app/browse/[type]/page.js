import { createClient } from '@supabase/supabase-js';
import BrowseClient from './BrowseClient';

export const revalidate = 600; // 10분마다 재생성

const VALID = ['music', 'sfx', 'video'];

async function getAssets(type) {
  if (!VALID.includes(type)) return [];
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = await db.from('assets').select('*').eq('status', 'active').eq('type', type)
      .order('created_at', { ascending: false }).limit(60);
    return data || [];
  } catch {
    return [];
  }
}

export default async function Page({ params }) {
  const initialAssets = await getAssets(params.type);
  return <BrowseClient params={params} initialAssets={initialAssets} />;
}
