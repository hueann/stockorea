'use client';
import { useLang } from '@/lib/i18n';

export default function License() {
  const { t } = useLang();
  return (
    <div className="container">
      <h2 className="page-title">{t('license.title')}</h2>
      <p className="page-sub">{t('license.sub')}</p>
      <div className="license-grid">
        <div className="license-card ok">
          <div style={{ fontSize: 28 }}>✅</div>
          <h3>{t('license.okTitle')}</h3>
          <ul>
            <li>{t('license.ok1')}</li>
            <li>{t('license.ok2')}</li>
            <li>{t('license.ok3')}</li>
            <li>{t('license.ok4')}</li>
            <li>{t('license.ok5')}</li>
          </ul>
        </div>
        <div className="license-card ok">
          <div style={{ fontSize: 28 }}>💼</div>
          <h3>{t('license.comTitle')}</h3>
          <ul>
            <li>{t('license.com1')}</li>
            <li>{t('license.com2')}</li>
            <li>{t('license.com3')}</li>
          </ul>
          <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: 10 }}>
            {t('license.comNote')}
          </p>
        </div>
        <div className="license-card no">
          <div style={{ fontSize: 28 }}>🚫</div>
          <h3>{t('license.noTitle')}</h3>
          <ul>
            <li>{t('license.no1')}</li>
            <li>{t('license.no2')}</li>
            <li>{t('license.no3')}</li>
            <li>{t('license.no4')}</li>
            <li>{t('license.no5')}</li>
          </ul>
        </div>
      </div>
      <div className="notice">
        <strong>{t('license.noticeTitle')}</strong> — {t('license.noticeBody')}
      </div>
    </div>
  );
}
