import { createClient } from '@supabase/supabase-js';
import AssetDetailClient from './AssetDetailClient';

const SITE = 'https://www.stockorea.com';
const TYPE_KO = { music: '음악', sfx: '효과음', video: '영상' };

export async function generateMetadata({ params }) {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const { data: a } = await db.from('assets')
      .select('title, title_en, description, type, category, mood, thumbnail_path')
      .eq('id', params.id).single();
    if (!a) return { title: '콘텐츠를 찾을 수 없습니다' };

    const typeKo = TYPE_KO[a.type] || '';
    const title = a.title;
    const desc = a.description
      || `${a.title} · ${a.category} ${typeKo}${a.mood ? ' · ' + a.mood : ''} — 스톡코리아 로열티 프리 ${typeKo}. 미리듣기 후 바로 다운로드.`;
    const img = a.thumbnail_path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/previews/${a.thumbnail_path}`
      : '/og-default.png';
    const url = `${SITE}/asset/${params.id}`;
    const ogTitle = `${title} — 스톡코리아 STOCKOREA`;

    return {
      title,
      description: desc,
      alternates: { canonical: `/asset/${params.id}` },
      openGraph: { type: 'website', title: ogTitle, description: desc, url, images: [img] },
      twitter: { card: 'summary_large_image', title: ogTitle, description: desc, images: [img] },
    };
  } catch {
    return {};
  }
}

export default function Page({ params }) {
  return <AssetDetailClient params={params} />;
}
