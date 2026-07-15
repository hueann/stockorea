import { NextResponse } from 'next/server';
import { admin, userFromRequest, isAdminUser } from '@/lib/supabaseServer';

async function requireAdmin(req) {
  const user = await userFromRequest(req);
  if (!user) return { error: NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 }) };
  if (!(await isAdminUser(user.id))) {
    return { error: NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 }) };
  }
  return { user };
}

// ── 수정 (파일은 브라우저가 스토리지에 직접 업로드하고, 여기엔 경로만 전달) ──
export async function PATCH(req, { params }) {
  const gate = await requireAdmin(req);
  if (gate.error) return gate.error;
  const a = admin();

  const { data: existing, error: eGet } = await a.from('assets').select('*').eq('id', params.id).single();
  if (eGet || !existing) return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 }); }

  const has = (k) => Object.prototype.hasOwnProperty.call(body, k);
  const str = (k, cur) => (has(k) ? (String(body[k] ?? '').trim() || null) : cur);

  // 새 경로가 오면 교체 + 옛 파일 삭제 대상, 없으면 기존 유지
  const toRemove = { originals: [], previews: [] };
  function pathField(k, bucket, current) {
    if (has(k) && body[k] && body[k] !== current) {
      if (current) toRemove[bucket].push(current);
      return body[k];
    }
    return current;
  }
  const file_path = pathField('file_path', 'originals', existing.file_path);
  const preview_path = pathField('preview_path', 'previews', existing.preview_path);
  const thumbnail_path = pathField('thumbnail_path', 'previews', existing.thumbnail_path);

  const tags = has('tags')
    ? String(body.tags || '').split(',').map((t) => t.trim()).filter(Boolean)
    : existing.tags;

  const update = {
    type: has('type') ? String(body.type || existing.type) : existing.type,
    title: has('title') ? String(body.title || '') : existing.title,
    title_en: str('title_en', existing.title_en),
    description: str('description', existing.description),
    category: has('category') ? String(body.category || '') : existing.category,
    subcategory: str('subcategory', existing.subcategory),
    mood: str('mood', existing.mood),
    tags,
    duration: str('duration', existing.duration),
    bpm: has('bpm') ? (String(body.bpm ?? '').trim() ? Number(body.bpm) : null) : existing.bpm,
    resolution: str('resolution', existing.resolution),
    format: str('format', existing.format),
    price: has('price') ? Number(body.price || 0) : existing.price,
    license: has('license') ? String(body.license || 'commercial') : existing.license,
    status: has('status') ? String(body.status || 'active') : existing.status,
    file_path,
    preview_path,
    thumbnail_path,
  };

  const { error: eUpd } = await a.from('assets').update(update).eq('id', params.id);
  if (eUpd) return NextResponse.json({ error: '수정 저장 실패: ' + eUpd.message }, { status: 500 });

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
