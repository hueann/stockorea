'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLang } from '@/lib/i18n';

function FailInner() {
  const { t } = useLang();
  const sp = useSearchParams();
  const message = sp.get('message') || sp.get('reason') || t('checkout.failDefault');
  return (
    <div className="container">
      <div className="form-wrap" style={{ textAlign: 'center' }}>
        <h2 className="page-title">{t('checkout.failTitle')}</h2>
        <div className="error-msg" style={{ textAlign: 'left' }}>{message}</div>
        <a className="btn btn-primary" href="/">{t('checkout.backHome')}</a>
      </div>
    </div>
  );
}

export default function CheckoutFail() {
  return <Suspense fallback={null}><FailInner /></Suspense>;
}
