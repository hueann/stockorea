'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function AboutPage() {
  const { t } = useLang();
  const dirs = t('about.dirs').split(',');
  return (
    <div className="container">
      <h2 className="page-title">{t('about.title')}</h2>
      <p className="about-hero">{t('about.heroLine')}</p>
      <div style={{ maxWidth: 720 }}>
        <p className="about-p"><b>{t('about.intro1')}</b></p>
        <p className="about-p">{t('about.intro2')}</p>
        <p className="about-p">{t('about.intro3')}</p>
      </div>

      <h3 className="svc-section-title about-eyebrow">{t('about.wTitle')}</h3>
      <div className="svc-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="svc-card">
          <h3>{t('about.w1t')}</h3>
          <p>{t('about.w1d')}</p>
          <Link href="/services/video-production">{t('svc.more')}</Link>
        </div>
        <div className="svc-card">
          <h3>{t('about.w2t')}</h3>
          <p>{t('about.w2d')}</p>
          <Link href="/services/location-sound">{t('svc.more')}</Link>
        </div>
        <div className="svc-card">
          <h3>{t('about.w3t')}</h3>
          <p>{t('about.w3d')}</p>
          <Link href="/services/sound-mixing">{t('svc.more')}</Link>
        </div>
        <div className="svc-card">
          <h3>{t('about.w4t')}</h3>
          <p>{t('about.w4d')}</p>
          <Link href="/browse/music">{t('svc.more')}</Link>
        </div>
      </div>

      <h3 className="svc-section-title about-eyebrow">{t('about.dTitle')}</h3>
      <div className="svc-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="svc-card diff">
          <h3>{t('about.d1t')}</h3>
          <p>{t('about.d1d')}</p>
        </div>
        <div className="svc-card diff">
          <h3>{t('about.d2t')}</h3>
          <p>{t('about.d2d')}</p>
        </div>
      </div>

      <h3 className="svc-section-title">{t('about.dirTitle')}</h3>
      <div className="svc-tags">
        {dirs.map((x) => <span key={x}>{x}</span>)}
      </div>

      <blockquote className="about-oneline">{t('about.oneLine')}</blockquote>

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
