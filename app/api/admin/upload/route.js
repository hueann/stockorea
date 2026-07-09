import { NextResponse } from 'next/server';
import { admin, userFromRequest, isAdminUser } from '@/lib/supabaseServer';

export const maxDuration = 60;

function safeName(name) {
  const ext = name.includes('.') ? name.split('.').pop() : 'bin';
  return `${crypto.randomUUID()}.${ext}`;
}

export async function POST(req) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  if (!(await isAdminUser(user.id))) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
  }

  const fd = await req.formData();
  const original = fd.get('original');
  const preview = fd.get('preview');
  if (!original || typeof original === 'string') {
    return NextResponse.json({ error: '원본 파일이 없습니다.' }, { status: 400 });
  }

  const a = admin();
  const type = String(fd.get('type') || 'music');

  // 1) 원본 업로드 (비공개)
  const filePath = `${type}/${safeName(original.name)}`;
  const { error: e1 } = await a.storage.from('originals')
    .upload(filePath, original, { contentType: original.type || 'application/octet-stream' });
  if (e1) return NextResponse.json({ error: '원본 업로드 실패: ' + e1.message }, { status: 500 });

  // 2) 미리보기 업로드 (공개)
  let previewPath = null;
  if (preview && typeof preview !== 'string') {
    previewPath = `${type}/${safeName(preview.name)}`;
    const { error: e2 } = await a.storage.from('previews')
      .upload(previewPath, preview, { contentType: preview.type || 'application/octet-stream' });
    if (e2) return NextResponse.json({ error: '미리보기 업로드 실패: ' + e2.message }, { status: 500 });
  }

  // 3) 콘텐츠 등록
  const tags = String(fd.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean);
  const bpmRaw = String(fd.get('bpm') || '');
  const { data: asset, error: e3 } = await a.from('assets').insert({
    type,
    title: String(fd.get('title') || ''),
    title_en: String(fd.get('title_en') || '') || null,
    description: String(fd.get('description') || '') || null,
    category: String(fd.get('category') || ''),
    subcategory: String(fd.get('subcategory') || '') || null,
    mood: String(fd.get('mood') || '') || null,
    tags,
    duration: String(fd.get('duration') || '') || null,
    bpm: bpmRaw ? Number(bpmRaw) : null,
    resolution: String(fd.get('resolution') || '') || null,
    format: String(fd.get('format') || '') || null,
    price: Number(fd.get('price') || 0),
    preview_path: previewPath,
    file_path: filePath,
    status: 'active',
  }).select().single();

  if (e3) return NextResponse.json({ error: '콘텐츠 등록 실패: ' + e3.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: asset.id });
}
