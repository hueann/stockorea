import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LangProvider } from '@/lib/i18n';

const SITE_NAME = '스톡코리아 STOCKOREA';
const DEFAULT_TITLE = '스톡코리아 STOCKOREA — 한국형 영상·사운드 스톡 플랫폼';
const DEFAULT_DESC = '광고·홍보·유튜브·숏폼 콘텐츠 제작을 위한 한국형 음악·효과음·영상 스톡 플랫폼. 한국 전통문화·도시·자연·음식 콘텐츠 전문.';

export const metadata = {
  metadataBase: new URL('https://www.stockorea.com'),
  title: {
    default: DEFAULT_TITLE,
    template: '%s — 스톡코리아 STOCKOREA',
  },
  description: DEFAULT_DESC,
  keywords: ['스톡코리아', '한국 스톡영상', '국악 BGM', '전통시장 효과음', '로열티 프리', 'korean stock footage', 'korean ambience', 'k-sound'],
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': '/rss.xml' },
  },
  verification: { google: '6sZmZx1pJhEMFGWRMR0K3pJrrp7HN0Otlys44w4shwA' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    url: 'https://www.stockorea.com',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: [{ url: '/og-default.png', width: 1200, height: 1200, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    images: ['/og-default.png'],
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <LangProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
