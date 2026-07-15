import { NextResponse } from 'next/server';
import { admin, userFromRequest, isAdminUser } from '@/lib/supabaseServer';

export const maxDuration = 60;

function safeName(name) {
  const ext = name && name.includes('.') ? name.split('.').pop() : 'bin';
  return `${crypto.randomUUID()}.${ext}`;
}

async function requireAdmin(req) {
  const user = await userFromRequest(req);
  if (!user) return { error: NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 }) };
  if (!(await isAdminUser(user.id))) {
    return { error: NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 }) };
  }
  return { user };
}

// ── 수정 ──
export async function PATCH(req, { params }) {
  const gate = await requireAdmin(req);
  if (gate.error) return gate.error;
  const a = admin();

  const { data: existing, error: eGet } = await a.from('assets').select('*').eq('id', params.id).single();
  if (eGet || !existing) return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });

  const fd = await req.formData();
  const type = String(fd.get('type') || existing.type);

  // 파일 교체 처리 (없으면 기존 유지)
  let file_path = existing.file_path;
  let preview_path = existing.preview_path;
  let thumbnail_path = existing.thumbnail_path;
  const toRemove = { originals: [], previews: [] };

  async function replace(field, bucket, current) {
    const f = fd.get(field);
    if (!f || typeof f === 'string' || f.size === 0) return current; // 새 파일 없음 → 유지
    const path = `${type}/${safeName(f.name)}`;
    const { error } = await a.storage.from(bucket).upload(path, f, { contentType: f.type || 'application/octet-stream' });
    if (error) throw new Error(`${field} 업로드 실패: ${error.message}`);
    if (current) toRemove[bucket].push(current); // 교체 후 옛 파일 삭제 대상
    return path;
  }

  try {
    file_path = await replace('original', 'originals', existing.file_path);
    preview_path = await replace('preview', 'previews', existing.preview_path);
    thumbnail_path = await replace('thumbnail', 'previews', existing.thumbnail_path);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  const has = (k) => fd.has(k);
  const str = (k, cur) => (has(k) ? (String(fd.get(k) || '') || null) : cur);
  const tagsRaw = fd.get('tags');
  const tags = has('tags')
    ? String(tagsRaw || '').split(',').map((t) => t.trim()).filter(Boolean)
    : existing.tags;
  const bpmRaw = fd.get('bpm');

  const update = {
    type,
    title: has('title') ? String(fd.get('title') || '') : existing.title,
    title_en: str('title_en', existing.title_en),
    description: str('description', existing.description),
    category: has('category') ? String(fd.get('category') || '') : existing.category,
    subcategory: str('subcategory', existing.subcategory),
    mood: str('mood', existing.mood),
    tags,
    duration: str('duration', existing.duration),
    bpm: has('bpm') ? (String(bpmRaw || '') ? Number(bpmRaw) : null) : existing.bpm,
    resolution: str('resolution', existing.resolution),
    format: str('format', existing.format),
    price: has('price') ? Number(fd.get('price') || 0) : existing.price,
    license: has('license') ? String(fd.get('license') || 'commercial') : existing.license,
    status: has('status') ? String(fd.get('status') || 'active') : existing.status,
    file_path,
    preview_path,
    thumbnail_path,
  };

  const { error: eUpd } = await a.from('assets').update(update).eq('id', params.id);
  if (eUpd) return NextResponse.json({ error: '수정 저장 실패: ' + eUpd.message }, { status: 500 });

  // 교체된 옛 파일 정리 (실패해도 무시)
  if (toRemove.originals.length) await a.storage.from('originals').remove(toRemove.originals).catch(() => {});
  if (toRemove.previews.length) await a.storage.from('previews').remove(toRemove.previews).catch(() => {});

  return NextResponse.json({ ok: true, id: params.id });
}

// ── 삭제 ──
export async function DELETE(req, { params }) {
  const gate = await requireAdmin(req);
  if (gate.error) return gate.error;
  const a = admin();

  const { data: asset } = await a.from('assets').select('*').eq('id', params.id).single();
  if (!asset) return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });

  // 구매 이력이 있으면 차단 (FK 보호 + 실수 방지)
  const { count } = await a.from('purchases').select('id', { count: 'exact', head: true }).eq('asset_id', params.id);
  if (count && count > 0) {
    return NextResponse.json({ error: `구매 이력이 ${count}건 있어 삭제할 수 없습니다. '숨김' 처리해 주세요.` }, { status: 409 });
  }

  const orig = [asset.file_path].filter(Boolean);
  const pub = [asset.preview_path, asset.thumbnail_path].filter(Boolean);
  if (orig.length) await a.storage.from('originals').remove(orig).catch(() => {});
  if (pub.length) await a.storage.from('previews').remove(pub).catch(() => {});

  const { error } = await a.from('assets').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: '삭제 실패: ' + error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
