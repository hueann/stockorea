'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabaseBrowser';
import { CATEGORIES, TYPES } from '@/lib/categories';
import { useLang, typeLabel, catLabel, SUBCATS } from '@/lib/i18n';
import { AssetList } from '@/components/AssetItem';

function BrowseInner({ params, initialAssets }) {
  const type = params.type; // music | sfx | video
  const sp = useSearchParams();
  const { t, lang } = useLang();
  const [assets, setAssets] = useState(initialAssets ?? null);
  const [cat, setCat] = useState('전체');
  const [q, setQ] = useState(sp.get('q') || '');

  useEffect(() => {
    // 필터·검색을 위해 전체 목록을 다시 받아옴 (SSR 초기 목록은 유지, 완료되면 갱신)
    let cancel = false;
    sb().from('assets').select('*').eq('status', 'active').eq('type', type)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (!cancel) setAssets(data || []); });
    setCat('전체');
    return () => { cancel = true; };
  }, [type]);

  if (!TYPES[type]) return <div className="container"><div className="empty">{t('browse.badPath')}</div></div>;

  const filtered = (assets || []).filter((a) => {
    if (cat !== '전체' && a.category !== cat) return false;
    if (q) {
      const hay = `${a.title} ${a.title_en || ''} ${a.category} ${a.subcategory || ''} ${a.mood || ''} ${(a.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="container">
      <h2 className="page-title">{typeLabel(type, lang)}</h2>
      <p className="page-sub">
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('browse.searchPlaceholder')}
          style={{ padding: '10px 16px', border: '1px solid var(--border)', borderRadius: 8, width: 280, maxWidth: '100%', fontSize: 14 }}
        />
      </p>
      <div className="chips">
        {['전체', ...CATEGORIES[type]].map((c) => (
          <button key={c} className={`chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{catLabel(c, lang)}</button>
        ))}
      </div>
      {SUBCATS[type] && (
        <p className="subcats">
          {(SUBCATS[type][lang] || SUBCATS[type].ko).map(([b, items], i, arr) => (
            <span key={b}><b>{b}</b> {items}{i < arr.length - 1 ? '  |  ' : ''}</span>
          ))}
        </p>
      )}
      {assets === null ? <div className="empty">{t('common.loading')}</div> : <AssetList assets={filtered} />}
    </div>
  );
}

export default function BrowseClient({ params, initialAssets }) {
  return (
    <Suspense fallback={<div className="container"><div className="empty">불러오는 중…</div></div>}>
      <BrowseInner params={params} initialAssets={initialAssets} />
    </Suspense>
  );
}
