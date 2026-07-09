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
  const [type, setType] = useState('all');
  const router = useRouter();
  const { t } = useLang();

  useEffect(() => {
    sb().from('assets').select('*').eq('status', 'active')
      .order('created_at', { ascending: false }).limit(40)
      .then(({ data }) => setAssets(data || []));
  }, []);

  function search(e) {
    e.preventDefault();
    const dest = type === 'all' ? 'music' : type;
    router.push(`/browse/${dest}?q=${encodeURIComponent(q)}`);
  }

  const music = assets.filter((a) => a.type === 'music');
  const sfx = assets.filter((a) => a.type === 'sfx');
  const video = assets.filter((a) => a.type === 'video');

  const quickCats = [
    { label: t('nav.music'), href: '/browse/music' },
    { label: t('nav.sfx'), href: '/browse/sfx' },
    { label: t('nav.video'), href: '/browse/video' },
    { label: t('home.qcTradition'), href: '/browse/video' },
    { label: t('home.qcCity'), href: '/browse/video' },
    { label: t('home.qcNature'), href: '/browse/video' },
    { label: t('home.qcFood'), href: '/browse/video' },
    { label: t('home.qcIndustry'), href: '/browse/video' },
    { label: t('home.qcShort'), href: '/browse/music' },
  ];

  const planPreviews = [
    { name: t('pricing.payName'), desc: t('pricing.payDesc'), price: t('pricing.payPrice'), popular: false },
    { name: t('pricing.subName'), desc: t('pricing.subDesc'), price: t('pricing.subPrice'), unit: t('pricing.subUnit'), popular: true, badge: t('pricing.popular') },
    { name: t('pricing.bizName'), desc: t('pricing.bizDesc'), price: t('pricing.bizPrice'), unit: t('pricing.bizUnit'), popular: false },
    { name: t('pricing.entName'), desc: t('pricing.entDesc'), price: t('pricing.entPrice'), popular: false },
  ];

  return (
    <>
      <div className="hero">
        <h1>{t('home.heroTitle')}</h1>
        <p>{t('home.heroSub')}</p>
        <form className="search-bar" onSubmit={search}>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">{t('home.searchAll')}</option>
            <option value="music">{t('nav.music')}</option>
            <option value="sfx">{t('nav.sfx')}</option>
            <option value="video">{t('nav.video')}</option>
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('home.searchPlaceholder')} />
          <button type="submit">{t('home.searchBtn')}</button>
        </form>
        <div className="hero-hint">{t('home.heroHint')}</div>
        <div className="quick-cats">
          {quickCats.map((c, i) => <Link key={i} href={c.href}>{c.label}</Link>)}
        </div>
      </div>

      <div className="container">
        <h3 className="section-title">{t('home.popularMusic')} <Link href="/browse/music">{t('home.viewAll')}</Link></h3>
        <AssetList assets={music.slice(0, 3)} />

        <h3 className="section-title">{t('home.adSfx')} <Link href="/browse/sfx">{t('home.viewAll')}</Link></h3>
        <AssetList assets={sfx.slice(0, 3)} />

        <h3 className="section-title">{t('home.localVideo')} <Link href="/browse/video">{t('home.viewAll')}</Link></h3>
        <AssetList assets={video.slice(0, 4)} />

        <h3 className="section-title">{t('home.newUploads')} <Link href="/browse/video">{t('home.viewAll')}</Link></h3>
        <AssetList assets={assets.slice(0, 4)} />

        <h3 className="section-title">{t('home.plansTitle')} <Link href="/pricing">{t('home.seeDetails')}</Link></h3>
        <div className="plans" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          {planPreviews.map((p, i) => (
            <Link key={i} href="/pricing" className={`plan plan-preview${p.popular ? ' popular' : ''}`}>
              {p.badge && <div className="badge">{p.badge}</div>}
              <h3>{p.name}</h3>
              <p className="desc">{p.desc}</p>
              <div className="price">{p.price}{p.unit && <small>{p.unit}</small>}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
