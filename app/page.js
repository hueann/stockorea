'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabaseBrowser';
import { useLang } from '@/lib/i18n';
import { AssetList } from '@/components/AssetItem';

export default function Home() {
  const [assets, setAssets] = useState([]);
  const [q, setQ] = useState('');
  const router = useRouter();
  const { t } = useLang();

  useEffect(() => {
    sb().from('assets').select('*').eq('status', 'active')
      .order('created_at', { ascending: false }).limit(24)
      .then(({ data }) => setAssets(data || []));
  }, []);

  function search(e) {
    e.preventDefault();
    router.push(`/browse/music?q=${encodeURIComponent(q)}`);
  }

  const music = assets.filter((a) => a.type === 'music').slice(0, 4);
  const sfx = assets.filter((a) => a.type === 'sfx').slice(0, 4);
  const video = assets.filter((a) => a.type === 'video').slice(0, 4);

  return (
    <>
      <div className="hero">
        <h1>{t('home.heroTitle')}</h1>
        <p>{t('home.heroSub')}</p>
        <form className="search-bar" onSubmit={search}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('home.searchPlaceholder')} />
          <button type="submit">{t('home.searchBtn')}</button>
        </form>
        <div className="hero-hint">{t('home.heroHint')}</div>
      </div>
      <div className="container">
        <h3 className="section-title">{t('home.latestMusic')} <Link href="/browse/music">{t('home.viewAll')}</Link></h3>
        <AssetList assets={music} />
        <h3 className="section-title">{t('home.latestSfx')} <Link href="/browse/sfx">{t('home.viewAll')}</Link></h3>
        <AssetList assets={sfx} />
        <h3 className="section-title">{t('home.latestVideo')} <Link href="/browse/video">{t('home.viewAll')}</Link></h3>
        <AssetList assets={video} />
      </div>
    </>
  );
}
