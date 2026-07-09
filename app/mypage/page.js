'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabaseBrowser';
import { useLang, typeLabel, assetTitle, price } from '@/lib/i18n';

function MyPageInner() {
  const { t, lang } = useLang();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState(null);
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

  return (
    <div className="container">
      <h2 className="page-title">{t('mypage.title')}</h2>
      <p className="page-sub">{user.email}</p>
      {paid && <div className="ok-msg">{t('mypage.paidOk')}</div>}

      <h3 className="section-title">{t('mypage.sectionTitle')}</h3>
      {purchases.length === 0 ? (
        <div className="empty">{t('mypage.emptyMine')}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data">
            <thead>
              <tr><th>{t('mypage.thDate')}</th><th>{t('mypage.thItem')}</th><th>{t('mypage.thType')}</th><th>{t('mypage.thAmount')}</th><th>{t('mypage.thLicense')}</th><th></th></tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR')}</td>
                  <td>{p.assets ? assetTitle(p.assets, lang) : '-'}</td>
                  <td>{p.assets ? typeLabel(p.assets.type, lang) : '-'}</td>
                  <td>{price(p.amount, lang)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {p.licenses?.[0]?.license_no || '-'}
                    <span className="status-tag ok" style={{ marginLeft: 8 }}>{t('mypage.commercial')}</span>
                  </td>
                  <td><button className="btn" onClick={() => download(p.assets?.id)}>{t('mypage.download')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
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
