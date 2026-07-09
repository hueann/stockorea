'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function Pricing() {
  const { t } = useLang();

  const plans = [
    { key: 'free', cta: t('pricing.freeCta'), href: '/login', features: ['freeF1', 'freeF2', 'freeF3'] },
    { key: 'pay', unit: 'payUnit', cta: t('pricing.payCta'), href: '/browse/music', features: ['payF1', 'payF2', 'payF3', 'payF4'] },
    { key: 'sub', unit: 'subUnit', popular: true, primary: true, cta: t('pricing.subCta'), href: '/login', features: ['subF1', 'subF2', 'subF3', 'subF4'] },
    { key: 'biz', unit: 'bizUnit', cta: t('pricing.bizCta'), href: '/login', features: ['bizF1', 'bizF2', 'bizF3', 'bizF4'] },
    { key: 'ent', cta: t('pricing.entCta'), href: '/biz', features: ['entF1', 'entF2', 'entF3', 'entF4', 'entF5'] },
  ];

  return (
    <div className="container">
      <h2 className="page-title">{t('pricing.title')}</h2>
      <p className="page-sub">{t('pricing.sub')}</p>
      <div className="plans">
        {plans.map((p) => (
          <div key={p.key} className={`plan${p.popular ? ' popular' : ''}`}>
            {p.popular && <div className="badge">{t('pricing.popular')}</div>}
            <div className="target">{t(`pricing.${p.key}Target`)}</div>
            <h3>{t(`pricing.${p.key}Name`)}</h3>
            <p className="desc">{t(`pricing.${p.key}Desc`)}</p>
            <div className="price">
              {t(`pricing.${p.key}Price`)}{p.unit && <small>{t(`pricing.${p.unit}`)}</small>}
            </div>
            <ul>
              {p.features.map((f) => <li key={f}>{t(`pricing.${f}`)}</li>)}
            </ul>
            <Link href={p.href} className={`btn${p.primary ? ' btn-primary' : ''}`}>{p.cta}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
