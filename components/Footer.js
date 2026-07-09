'use client';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="site">
      <div className="container">
        <div style={{ maxWidth: 340 }}>
          <h4>스톡코리아 STOCKOREA</h4>
          <p>
            {t('footer.company')}<br />
            {t('footer.bizNo')}<br />
            {t('footer.address')}<br />
            hueann1@naver.com · stockorea.com
          </p>
        </div>
        <div>
          <h4>{t('footer.contentHead')}</h4>
          <ul>
            <li><Link href="/browse/music">{t('nav.music')}</Link></li>
            <li><Link href="/browse/sfx">{t('nav.sfx')}</Link></li>
            <li><Link href="/browse/video">{t('nav.video')}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t('footer.guideHead')}</h4>
          <ul>
            <li><Link href="/pricing">{t('nav.pricing')}</Link></li>
            <li><Link href="/license">{t('footer.guideLicense')}</Link></li>
            <li><Link href="/mypage">{t('nav.mypage')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="copyright">© 2026 주식회사 휴앤 · STOCKOREA. All rights reserved.</div>
    </footer>
  );
}
