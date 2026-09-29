'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function LocationSoundPage() {
  const { t } = useLang();
  const uses = t('svc.lUses').split(',');
  const steps = t('svc.lSteps').split(',');
  return (
    <div className="container">
      <h2 className="page-title">{t('svc.lH1')}</h2>
      <p className="page-sub">{t('svc.lSub')}</p>

      <ul className="svc-list" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <li><b>{t('svc.lU1t')}</b>{t('svc.lU1d')}</li>
        <li><b>{t('svc.lU2t')}</b>{t('svc.lU2d')}</li>
        <li><b>{t('svc.lU3t')}</b>{t('svc.lU3d')}</li>
      </ul>

      <h3 className="svc-section-title">{t('svc.lUseTitle')}</h3>
      <div className="svc-tags">
        {uses.map((x) => <span key={x}>{x}</span>)}
      </div>

      <h3 className="svc-section-title">{t('svc.process')}</h3>
      <div className="svc-steps">
        {steps.map((x) => <span key={x}>{x}</span>)
          .reduce((acc, el, i) => (i === 0 ? [el] : [...acc, <span key={'a' + i} className="arr">→</span>, el]), [])}
      </div>

      <div className="svc-faq">
        <h3 className="svc-section-title">{t('svc.lFaqTitle')}</h3>
        <h4>{t('svc.lF1q')}</h4><p>{t('svc.lF1a')}</p>
        <h4>{t('svc.lF2q')}</h4><p>{t('svc.lF2a')}</p>
        <h4>{t('svc.lF3q')}</h4>
        <p>{t('svc.lF3a')} <Link href="/services/sound-mixing" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('svc.mTitle')} →</Link></p>
      </div>

      <div className="svc-cta">
        <h3>{t('svc.ctaTitle')}</h3>
        <p>{t('svc.ctaSub')} · hueann1@naver.com</p>
        <Link className="btn-cta" href="/biz">{t('svc.ctaBtn')}</Link>
      </div>
    </div>
  );
}
