import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LangProvider } from '@/lib/i18n';

export const metadata = {
  title: '스톡코리아 STOCKOREA — 한국형 영상·사운드 스톡 플랫폼',
  description: '광고, 홍보, 유튜브, 숏폼 콘텐츠 제작을 위한 한국형 음악·효과음·영상 스톡 플랫폼',
  icons: {
    icon: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Crect%20width='24'%20height='100'%20fill='%23B5121B'/%3E%3Cpolygon%20points='24,55%2076,0%20100,0%2042,62'%20fill='%23B5121B'/%3E%3Cpolygon%20points='28,48%2052,48%2094,100%2068,100'%20fill='%23B5121B'/%3E%3Cg%20fill='%23fff'%3E%3Crect%20x='1.5'%20y='45'%20width='2.6'%20height='10'%20rx='1.3'/%3E%3Crect%20x='4.9'%20y='40'%20width='2.6'%20height='20'%20rx='1.3'/%3E%3Crect%20x='8.3'%20y='33'%20width='2.6'%20height='34'%20rx='1.3'/%3E%3Crect%20x='11.7'%20y='26'%20width='2.6'%20height='48'%20rx='1.3'/%3E%3Crect%20x='15.1'%20y='33'%20width='2.6'%20height='34'%20rx='1.3'/%3E%3Crect%20x='18.5'%20y='40'%20width='2.6'%20height='20'%20rx='1.3'/%3E%3Crect%20x='21.5'%20y='44'%20width='2.4'%20height='12'%20rx='1.2'/%3E%3C/g%3E%3C/svg%3E",
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
