'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb, previewUrl } from '@/lib/supabaseBrowser';
import { gradientFor } from '@/lib/categories';
import { useLang, typeLabel, catLabel, assetTitle } from '@/lib/i18n';
import Waveform from '@/components/Waveform';
import Watermark from '@/components/Watermark';

export default function AssetDetailClient({ params, initialAsset = null }) {
  const [asset, setAsset] = useState(initialAsset);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { t, lang } = useLang();

  useEffect(() => {
    if (asset) return; // 서버에서 이미 받아온 경우 재조회 불필요
    sb().from('assets').select('*').eq('id', params.id).single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setAsset(data);
      });
  }, [params.id]);

  async function buy() {
    setBusy(true);
    const { data: { user } } = await sb().auth.getUser();
    if (!user) { router.push(`/login?next=/asset/${params.id}`); return; }
    if (asset.price === 0) {
      // 무료 콘텐츠는 바로 다운로드
      const { data: { session } } = await sb().auth.getSession();
      const res = await fetch(`/api/download/${asset.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = await res.json();
      setBusy(false);
      if (j.url) window.location.href = j.url;
      else alert(j.error || t('common.downloadFail'));
      return;
    }
    router.push(`/checkout/${asset.id}`);
  }

  if (notFound) return <div className="container"><div className="empty">{t('detail.notFound')}</div></div>;
  if (!asset) return <div className="container"><div className="empty">{t('common.loading')}</div></div>;

  const pv = previewUrl(asset.preview_path);
  const isVideo = asset.type === 'video';

  return (
    <div className="container">
      <div className="detail">
        <div>
          <h2 className="page-title">{assetTitle(asset, lang)}</h2>
          {(lang === 'en' ? asset.title : asset.title_en) && (
            <p className="page-sub">{lang === 'en' ? asset.title : asset.title_en}</p>
          )}
          <div className="preview-box" style={!pv ? { background: gradientFor(asset.id) } : {}}>
            {pv ? (
              isVideo
                ? <video src={pv} controls controlsList="nodownload" />
                : <div style={{ width: '100%', padding: '0 24px' }}>
                    <Waveform src={pv} height={96} bars={220} />
                  </div>
            ) : (
              <span>{isVideo ? '🎬' : '🎵'}</span>
            )}
            {isVideo && <Watermark />}
          </div>
          <div className="spec">
            <div><p>{t('detail.category')}</p><b>{typeLabel(asset.type, lang)} · {catLabel(asset.category, lang)}</b></div>
            {asset.duration && <div><p>{t('detail.duration')}</p><b>{asset.duration}</b></div>}
            {asset.format && <div><p>{t('detail.format')}</p><b>{asset.format}</b></div>}
            {asset.bpm && <div><p>{t('detail.bpm')}</p><b>{asset.bpm}</b></div>}
            {asset.resolution && <div><p>{t('detail.resolution')}</p><b>{asset.resolution}</b></div>}
            {asset.mood && <div><p>{t('detail.mood')}</p><b>{asset.mood}</b></div>}
            <div><p>{t('detail.uploaded')}</p><b>{String(asset.created_at).slice(0, 10).replace(/-/g, '.')}</b></div>
            <div><p>{t('detail.license')}</p><b>{asset.license === 'extended' ? (lang === 'en' ? 'Extended license' : '확장 라이선스') : t('detail.licenseVal')}</b></div>
          </div>
          {asset.description && <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8 }}>{asset.description}</p>}
          {asset.tags?.length > 0 && (
            <div className="tags">{asset.tags.map((tag) => <span key={tag}># {tag}</span>)}</div>
          )}
        </div>
        <div>
          <div className="buy-box">
            <div className="n">{t('detail.buyNote')}</div>
            <button className="btn btn-primary btn-lg" onClick={buy} disabled={busy}>
              {asset.price === 0 ? t('detail.freeDownload') : t('detail.buyNow')}
            </button>
            <a className="btn" href="/license">{t('detail.viewLicense')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
