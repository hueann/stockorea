'use client';
import Link from 'next/link';
import { previewUrl } from '@/lib/supabaseBrowser';
import { gradientFor } from '@/lib/categories';
import { useLang, assetTitle, catLabel } from '@/lib/i18n';
import Waveform from '@/components/Waveform';
import Watermark from '@/components/Watermark';

function subline(asset, lang) {
  if (lang === 'en') return catLabel(asset.category, 'en');
  return `${asset.category}${asset.subcategory ? ` · ${asset.subcategory}` : ''}${asset.mood ? ` · ${asset.mood}` : ''}`;
}

export function TrackRow({ asset }) {
  const { lang } = useLang();
  const pv = asset.preview_path ? previewUrl(asset.preview_path) : null;

  return (
    <div className="track">
      <div className="track-head">
        <Link href={`/asset/${asset.id}`} className="track-info">
          <h4>{assetTitle(asset, lang)}</h4>
          <p>{subline(asset, lang)}</p>
        </Link>
        <div className="track-side">
          {asset.duration && <span className="track-meta">{asset.duration}</span>}
        </div>
      </div>
      {pv ? (
        <Waveform src={pv} height={46} bars={160} gap={2} compact />
      ) : (
        <div className="wave-empty">{lang === 'en' ? 'Preview coming soon' : '미리듣기 준비 중'}</div>
      )}
    </div>
  );
}

export function VideoCard({ asset }) {
  const { lang } = useLang();
  return (
    <Link href={`/asset/${asset.id}`} className="card">
      <div className="thumb" style={{ background: gradientFor(asset.id) }}>
        {asset.preview_path ? (
          <video src={previewUrl(asset.preview_path)} muted loop playsInline preload="metadata"
            poster={asset.thumbnail_path ? previewUrl(asset.thumbnail_path) : undefined}
            onMouseOver={(e) => e.target.play().catch(() => {})}
            onMouseOut={(e) => { e.target.pause(); }} />
        ) : asset.thumbnail_path ? (
          <img src={previewUrl(asset.thumbnail_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>🎬</span>
        )}
        <Watermark tiles={16} />
        {asset.duration && <span className="dur">{asset.duration}</span>}
      </div>
      <div className="card-body">
        <h4>{assetTitle(asset, lang)}</h4>
        <p>{lang === 'en' ? catLabel(asset.category, 'en') : `${asset.category}${asset.subcategory ? ` · ${asset.subcategory}` : ''}`}</p>
        <div className="price-row">
          {asset.resolution && <span style={{ fontSize: 12, color: 'var(--gray)' }}>{asset.resolution}</span>}
        </div>
      </div>
    </Link>
  );
}

export function AssetList({ assets }) {
  const { t } = useLang();
  if (!assets?.length) return <div className="empty">{t('common.empty')}</div>;
  const videos = assets.filter((a) => a.type === 'video');
  const audio = assets.filter((a) => a.type !== 'video');
  return (
    <>
      {audio.map((a) => <TrackRow key={a.id} asset={a} />)}
      {videos.length > 0 && (
        <div className="grid" style={{ marginTop: audio.length ? 20 : 0 }}>
          {videos.map((a) => <VideoCard key={a.id} asset={a} />)}
        </div>
      )}
    </>
  );
}
