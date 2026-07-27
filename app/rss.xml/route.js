import { createClient } from '@supabase/supabase-js';

const SITE = 'https://www.stockorea.com';
const TYPE_KO = { music: '음악', sfx: '효과음', video: '영상' };

export const revalidate = 600; // 10분 캐시

function esc(s) {
  return String(s || '').replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ));
}

export async function GET() {
  let items = [];
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const { data } = await db.from('assets')
      .select('id, title, description, type, category, mood, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);
    items = data || [];
  } catch {
    items = [];
  }

  const now = new Date().toUTCString();
  const entries = items.map((a) => {
    const typeKo = TYPE_KO[a.type] || '';
    const link = `${SITE}/asset/${a.id}`;
    const desc = a.description
      || `${a.title} · ${a.category} ${typeKo}${a.mood ? ' · ' + a.mood : ''} — 스톡코리아 로열티 프리 ${typeKo}.`;
    const pub = a.created_at ? new Date(a.created_at).toUTCString() : now;
    return `    <item>
      <title>${esc(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <category>${esc(typeKo + ' · ' + a.category)}</category>
      <pubDate>${pub}</pubDate>
      <description>${esc(desc)}</description>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>스톡코리아 STOCKOREA — 최신 콘텐츠</title>
    <link>${SITE}</link>
    <description>한국형 음악·효과음·영상 스톡 플랫폼의 최신 콘텐츠</description>
    <language>ko</language>
    <lastBuildDate>${now}</lastBuildDate>
${entries}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
    },
  });
}
