'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function ServicesPage() {
  const { t } = useLang();
  return (
    <div className="container">
      <h2 className="page-title">{t('svc.ovTitle')}</h2>
      <p className="page-sub">{t('svc.ovSub')}</p>

      <div className="svc-grid">
        <div className="svc-card">
          <h3>{t('svc.vTitle')}</h3>
          <p>{t('svc.vDesc')}</p>
          <Link href="/services/video-production">{t('svc.more')}</Link>
        </div>
        <div className="svc-card">
          <h3>{t('svc.lTitle')}</h3>
          <p>{t('svc.lDesc')}</p>
          <Link href="/services/location-sound">{t('svc.more')}</Link>
        </div>
        <div className="svc-card">
          <h3>{t('svc.mTitle')}</h3>
          <p>{t('svc.mDesc')}</p>
          <Link href="/services/sound-mixing">{t('svc.more')}</Link>
        </div>
      </div>

      <div className="svc-cta">
        <h3>{t('svc.ctaTitle')}</h3>
        <p>{t('svc.ctaSub')}</p>
        <Link className="btn-cta" href="/biz">{t('svc.ctaBtn')}</Link>
      </div>
    </div>
  );
}
