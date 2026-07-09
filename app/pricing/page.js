'use client';
import { useLang } from '@/lib/i18n';

export default function Pricing() {
  const { t } = useLang();
  return (
    <div className="container">
      <h2 className="page-title">{t('pricing.title')}</h2>
      <p className="page-sub">{t('pricing.sub')}</p>
      <div className="plans">
        <div className="plan">
          <h3>{t('pricing.freeName')}</h3>
          <p className="desc">{t('pricing.freeDesc')}</p>
          <div className="price">{t('pricing.freePrice')}</div>
          <ul>
            <li>{t('pricing.freeF1')}</li>
            <li>{t('pricing.freeF2')}</li>
          </ul>
        </div>
        <div className="plan popular">
          <h3>{t('pricing.payName')}</h3>
          <p className="desc">{t('pricing.payDesc')}</p>
          <div className="price">{t('pricing.payPrice')}<small>{t('pricing.payUnit')}</small></div>
          <ul>
            <li>{t('pricing.payF1')}</li>
            <li>{t('pricing.payF2')}</li>
            <li>{t('pricing.payF3')}</li>
            <li>{t('pricing.payF4')}</li>
          </ul>
        </div>
        <div className="plan">
          <h3>{t('pricing.subName')}</h3>
          <p className="desc">{t('pricing.subDesc')}</p>
          <div className="price">{t('pricing.subPrice')}</div>
          <ul>
            <li>{t('pricing.subF1')}</li>
            <li>{t('pricing.subF2')}</li>
          </ul>
        </div>
        <div className="plan">
          <h3>{t('pricing.entName')}</h3>
          <p className="desc">{t('pricing.entDesc')}</p>
          <div className="price">{t('pricing.entPrice')}</div>
          <ul>
            <li>{t('pricing.entF1')}</li>
            <li>{t('pricing.entF2')}</li>
            <li>{t('pricing.entF3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
