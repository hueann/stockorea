import { createClient } from '@supabase/supabase-js';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stockorea.com';

// 12시간마다 사이트맵 갱신 (관리자가 콘텐츠를 추가해도 재배포 없이 반영)
export const revalidate = 43200;

export default async function sitemap() {
  const staticPaths = ['', '/browse/music', '/browse/sfx', '/browse/video', '/services', '/services/video-production', '/services/location-sound', '/services/sound-mixing', '/about', '/pricing', '/license', '/biz', '/support'];
  const now = new Date();
  const base = staticPaths.map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  let assets = [];
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = await db
      .from('assets')
      .select('id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10000);
    assets = (data || []).map((a) => ({
      url: `${SITE}/asset/${a.id}`,
      lastModified: a.created_at ? new Date(a.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch {
    // Supabase 조회 실패 시 정적 페이지만이라도 제공
  }

  return [...base, ...assets];
}
