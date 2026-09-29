'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useLang();
  return (
    <div className="container">
      <h2 className="page-title">{t('about.title')}</h2>
      <p className="page-sub">{t('about.sub')}</p>
      <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 680 }}>{t('about.intro')}</p>

      <div className="svc-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="svc-card">
          <h3>{t('about.p1Title')}</h3>
          <p>{t('about.p1Desc')}</p>
          <Link href="/browse/music">{t('svc.more')}</Link>
        </div>
        <div className="svc-card">
          <h3>{t('about.p2Title')}</h3>
          <p>{t('about.p2Desc')}</p>
          <Link href="/services">{t('svc.more')}</Link>
        </div>
      </div>

      <h3 className="svc-section-title">{t('about.whyTitle')}</h3>
      <ul className="svc-list" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <li><b>{t('about.w1t')}</b>{t('about.w1d')}</li>
        <li><b>{t('about.w2t')}</b>{t('about.w2d')}</li>
        <li><b>{t('about.w3t')}</b>{t('about.w3d')}</li>
      </ul>

      <h3 className="svc-section-title">{t('about.infoTitle')}</h3>
      <ul className="svc-list" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <li><b>{t('about.iCompany')}</b>{t('footer.company')}</li>
        <li><b>{t('about.iBizNo')}</b>468-81-02372</li>
        <li><b>{t('about.iMailOrder')}</b>{t('footer.mailOrder')}</li>
        <li><b>{t('about.iAddr')}</b>{t('footer.address')}</li>
        <li><b>{t('about.iMail')}</b>hueann1@naver.com</li>
        <li><b>{t('about.iSite')}</b>stockorea.com</li>
      </ul>

      <div className="svc-cta">
        <h3>{t('about.ctaTitle')}</h3>
        <p>{t('about.ctaSub')}</p>
        <Link className="btn-cta" href="/biz">{t('about.ctaBtn')}</Link>
      </div>
    </div>
  );
}
