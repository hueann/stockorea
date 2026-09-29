'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function SoundMixingPage() {
  const { t } = useLang();
  const steps = t('svc.mSteps').split(',');
  return (
    <div className="container">
      <h2 className="page-title">{t('svc.mTitle')}</h2>
      <p className="page-sub">{t('svc.mSub')}</p>
      <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 640 }}>{t('svc.mIntro')}</p>

      <ul className="svc-list">
        <li><b>{t('svc.mS1t')}</b>{t('svc.mS1d')}</li>
        <li><b>{t('svc.mS2t')}</b>{t('svc.mS2d')}</li>
        <li><b>{t('svc.mS3t')}</b>{t('svc.mS3d')}</li>
        <li><b>{t('svc.mS4t')}</b>{t('svc.mS4d')}</li>
      </ul>

      <h3 className="svc-section-title">{t('svc.process')}</h3>
      <div className="svc-steps">
        {steps.map((x) => <span key={x}>{x}</span>)
          .reduce((acc, el, i) => (i === 0 ? [el] : [...acc, <span key={'a' + i} className="arr">→</span>, el]), [])}
      </div>

      <div className="svc-cta">
        <h3>{t('svc.ctaTitle')}</h3>
        <p>{t('svc.ctaSub')}</p>
        <Link className="btn-cta" href="/biz">{t('svc.ctaBtn')}</Link>
      </div>
    </div>
  );
}
