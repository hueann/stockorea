'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { sb } from '@/lib/supabaseBrowser';
import { useLang, assetTitle, catLabel, price } from '@/lib/i18n';

export default function CheckoutPage({ params }) {
  const { t, lang } = useLang();
  const [asset, setAsset] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const router = useRouter();

  useEffect(() => {
    sb().auth.getUser().then(({ data }) => {
      if (!data?.user) router.push(`/login?next=/checkout/${params.id}`);
      else setUser(data.user);
    });
    sb().from('assets').select('*').eq('id', params.id).single()
      .then(({ data }) => setAsset(data));
  }, [params.id]);

  async function pay() {
    setErr(null); setBusy(true);
    try {
      // 1) 대기 주문 생성 (주문번호 = purchases.id)
      const { data: purchase, error } = await sb().from('purchases')
        .insert({ user_id: user.id, asset_id: asset.id, amount: asset.price, status: 'pending' })
        .select().single();
      if (error) throw new Error(t('checkout.orderFail') + error.message);

      // 2) 토스페이먼츠 결제창 호출
      const toss = window.TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
      const payment = toss.payment({ customerKey: user.id });
      const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: asset.price },
        orderId: purchase.id,
        orderName: assetTitle(asset, lang).slice(0, 90),
        successUrl: `${site}/api/checkout/confirm`,
        failUrl: `${site}/checkout/fail`,
        card: { flowMode: 'DEFAULT', useEscrow: false, useCardPoint: false, useAppCardOnly: false },
      });
    } catch (e) {
      setBusy(false);
      if (e?.code !== 'USER_CANCEL') setErr(e.message || t('checkout.reqFail'));
    }
  }

  if (!asset || !user) return <div className="container"><div className="empty">{t('common.loading')}</div></div>;

  return (
    <div className="container">
      <Script src="https://js.tosspayments.com/v2/standard" onLoad={() => setReady(true)} />
      <div className="form-wrap">
        <h2 className="page-title" style={{ textAlign: 'center' }}>{t('checkout.title')}</h2>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24, margin: '20px 0' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{assetTitle(asset, lang)}</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 14 }}>
            {catLabel(asset.category, lang)} · {t('checkout.includesLicense')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <span style={{ fontSize: 14 }}>{t('checkout.amount')}</span>
            <b style={{ fontSize: 20, color: 'var(--primary)' }}>{price(asset.price, lang)}</b>
          </div>
        </div>
        {err && <div className="error-msg">{err}</div>}
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={pay} disabled={!ready || busy}>
          {ready ? t('checkout.payCard') : t('checkout.loadingModule')}
        </button>
        <p className="form-note">{t('checkout.note')}</p>
      </div>
    </div>
  );
}
