import { NextResponse } from 'next/server';
import { admin, userFromRequest } from '@/lib/supabaseServer';

export async function GET(req, { params }) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const a = admin();
  const { data: asset } = await a.from('assets').select('*').eq('id', params.id).single();
  if (!asset) return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });

  // 유료 콘텐츠는 결제 완료 여부 확인 (무료는 통과)
  if (asset.price > 0) {
    const { data: purchase } = await a.from('purchases')
      .select('id').eq('user_id', user.id).eq('asset_id', asset.id).eq('status', 'paid')
      .limit(1).maybeSingle();
    if (!purchase) return NextResponse.json({ error: '구매 내역이 없습니다.' }, { status: 403 });
  }

  const { data: signed, error } = await a.storage.from('originals')
    .createSignedUrl(asset.file_path, 300, { download: true });
  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: '다운로드 링크 생성에 실패했습니다.' }, { status: 500 });
  }

  await a.from('assets').update({ downloads: (asset.downloads || 0) + 1 }).eq('id', asset.id);
  return NextResponse.json({ url: signed.signedUrl });
}
