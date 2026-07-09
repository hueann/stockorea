'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabaseBrowser';
import { useLang, typeLabel, assetTitle, price } from '@/lib/i18n';

function MyPageInner() {
  const { t, lang } = useLang();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [tab, setTab] = useState('purchases'); // purchases | downloads | licenses
  const router = useRouter();
  const paid = useSearchParams().get('paid');

  useEffect(() => {
    sb().auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/login?next=/mypage');
      else setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    sb().from('purchases')
      .select('*, assets(id,title,title_en,type,price,format), licenses(license_no,scope,created_at)')
      .eq('user_id', user.id).eq('status', 'paid')
      .order('created_at', { ascending: false })
      .then(({ data }) => setPurchases(data || []));
  }, [user]);

  async function download(assetId) {
    const { data: { session } } = await sb().auth.getSession();
    const res = await fetch(`/api/download/${assetId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const j = await res.json();
    if (j.url) window.location.href = j.url;
    else alert(j.error || t('common.downloadFail'));
  }

  if (!user || purchases === null) {
    return <div className="container"><div className="empty">{t('common.loading')}</div></div>;
  }

  const totalSpent = purchases.reduce((s, p) => s + (p.amount || 0), 0);
  const licenseCount = purchases.filter((p) => p.licenses?.[0]?.license_no).length;
  const fmtDate = (d) => new Date(d).toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR');

  const TABS = [
    { key: 'purchases', label: t('mypage.tabPurchases') },
    { key: 'downloads', label: t('mypage.tabDownloads') },
    { key: 'licenses', label: t('mypage.tabLicenses') },
  ];

  return (
    <div className="container">
      <h2 className="page-title">{t('mypage.title')}</h2>
      <p className="page-sub">{user.email}</p>
      {paid && <div className="ok-msg">{t('mypage.paidOk')}</div>}

      <div className="sub-status">
        <div className="stat-card"><p>{t('mypage.scMember')}</p><h3>{t('mypage.freeMember')}</h3></div>
        <div className="stat-card"><p>{t('mypage.scSpent')}</p><h3>{price(totalSpent, lang)}</h3></div>
        <div className="stat-card"><p>{t('mypage.scOrders')}</p><h3>{purchases.length}<small> {t('mypage.unit')}</small></h3></div>
        <div className="stat-card"><p>{t('mypage.scLicenses')}</p><h3>{licenseCount}<small> {t('mypage.unit')}</small></h3></div>
      </div>

      <div className="my-tabs">
        {TABS.map((tb) => (
          <button key={tb.key} className={tab === tb.key ? 'active' : ''} onClick={() => setTab(tb.key)}>{tb.label}</button>
        ))}
      </div>

      {purchases.length === 0 ? (
        <div className="empty">{t('mypage.emptyMine')}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          {tab === 'purchases' && (
            <table className="data">
              <thead><tr><th>{t('mypage.thDate')}</th><th>{t('mypage.thItem')}</th><th>{t('mypage.thType')}</th><th>{t('mypage.thAmount')}</th><th></th></tr></thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{fmtDate(p.created_at)}</td>
                    <td>{p.assets ? assetTitle(p.assets, lang) : '-'}</td>
                    <td>{p.assets ? typeLabel(p.assets.type, lang) : '-'}</td>
                    <td>{price(p.amount, lang)}</td>
                    <td><span className="status-tag ok">{t('mypage.commercial')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'downloads' && (
            <table className="data">
              <thead><tr><th>{t('mypage.thDate')}</th><th>{t('mypage.thItem')}</th><th>{t('mypage.thType')}</th><th>{t('mypage.thFormat')}</th><th></th></tr></thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{fmtDate(p.created_at)}</td>
                    <td>{p.assets ? assetTitle(p.assets, lang) : '-'}</td>
                    <td>{p.assets ? typeLabel(p.assets.type, lang) : '-'}</td>
                    <td>{p.assets?.format || '-'}</td>
                    <td><button className="btn" onClick={() => download(p.assets?.id)}>{t('mypage.redownload')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'licenses' && (
            <table className="data">
              <thead><tr><th>{t('mypage.thLicense')}</th><th>{t('mypage.thItem')}</th><th>{t('mypage.thScope')}</th><th>{t('mypage.thIssued')}</th></tr></thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.licenses?.[0]?.license_no || '-'}</td>
                    <td>{p.assets ? assetTitle(p.assets, lang) : '-'}</td>
                    <td><span className="status-tag ok">{t('mypage.commercial')}</span></td>
                    <td>{p.licenses?.[0]?.created_at ? fmtDate(p.licenses[0].created_at) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="notice" style={{ marginTop: 32 }}>
        <strong>{t('mypage.noticeTitle')}</strong> — {t('mypage.noticeBody')}
      </div>
    </div>
  );
}

export default function MyPage() {
  return <Suspense fallback={<div className="container"><div className="empty">불러오는 중…</div></div>}><MyPageInner /></Suspense>;
}
