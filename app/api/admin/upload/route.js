import { NextResponse } from 'next/server';
import { admin, userFromRequest, isAdminUser } from '@/lib/supabaseServer';

// 파일은 브라우저가 스토리지에 직접 업로드하고, 여기엔 경로+메타데이터(JSON)만 전달
export async function POST(req) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 }); }
  if (!b.file_path) return NextResponse.json({ error: '원본 파일이 없습니다.' }, { status: 400 });

  const s = (v) => (String(v ?? '').trim() || null);
  const tags = String(b.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  const a = admin();
  const { data: asset, error } = await a.from('assets').insert({
    type: String(b.type || 'music'),
    title: String(b.title || ''),
    title_en: s(b.title_en),
    description: s(b.description),
    category: String(b.category || ''),
    subcategory: s(b.subcategory),
    mood: s(b.mood),
    tags,
    duration: s(b.duration),
    bpm: String(b.bpm ?? '').trim() ? Number(b.bpm) : null,
    resolution: s(b.resolution),
    format: s(b.format),
    price: Number(b.price || 0),
    license: String(b.license || 'commercial'),
    preview_path: b.preview_path || null,
    thumbnail_path: b.thumbnail_path || null,
    file_path: b.file_path,
    status: 'active',
  }).select().single();

  if (error) return NextResponse.json({ error: '콘텐츠 등록 실패: ' + error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: asset.id });
}
