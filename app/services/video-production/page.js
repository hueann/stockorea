'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function VideoProductionPage() {
  const { t } = useLang();
  const steps = t('svc.vSteps').split(',');
  return (
    <div className="container">
      <h2 className="page-title">{t('svc.vTitle')}</h2>
      <p className="page-sub">{t('svc.vSub')}</p>
      <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 640 }}>{t('svc.vIntro')}</p>

      <ul className="svc-list">
        <li><b>{t('svc.vF1t')}</b>{t('svc.vF1d')}</li>
        <li><b>{t('svc.vF2t')}</b>{t('svc.vF2d')}</li>
        <li><b>{t('svc.vF3t')}</b>{t('svc.vF3d')}</li>
        <li><b>{t('svc.vF4t')}</b>{t('svc.vF4d')}</li>
      </ul>

      <h3 className="svc-section-title">{t('svc.process')}</h3>
      <div className="svc-steps">
        {steps.map((x, i) => (
          <span key={x} className={i === 0 ? '' : undefined}>
            {x}
          </span>
        )).reduce((acc, el, i) => (i === 0 ? [el] : [...acc, <span key={'a' + i} className="arr">→</span>, el]), [])}
      </div>

      <div className="svc-cta">
        <h3>{t('svc.ctaTitle')}</h3>
        <p>{t('svc.ctaSub')}</p>
        <Link className="btn-cta" href="/biz">{t('svc.ctaBtn')}</Link>
      </div>
    </div>
  );
}
