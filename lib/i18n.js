'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// ─── 카테고리/유형 영문 매핑 ───────────────────────────────
export const TYPE_LABEL = {
  ko: { music: '음악', sfx: '효과음', video: '영상' },
  en: { music: 'Music', sfx: 'Sound Effects', video: 'Footage' },
};

export const CATEGORY_LABEL = {
  // music
  '광고음악': 'Ad Music', '유튜브 BGM': 'YouTube BGM', '숏폼 음악': 'Short-form',
  '한국 감성 음악': 'Korean Sentiment', '기업용 음악': 'Corporate',
  // sfx
  '자연음': 'Nature', '도시음': 'Urban', '음식음': 'Food', '생활음': 'Daily Life',
  '한국 로컬 사운드': 'Korean Local', '광고 효과음': 'Ad SFX',
  // video
  '한국 도시': 'Korean Cities', '전통문화': 'Traditional Culture', '음식': 'Food',
  '자연': 'Nature', '산업·현장': 'Industrial', '숏폼 영상': 'Short-form',
  // common chip
  '전체': 'All',
};

// ─── UI 문구 사전 ─────────────────────────────────────────
const DICT = {
  nav: {
    music: { ko: '음악', en: 'Music' },
    sfx: { ko: '효과음', en: 'SFX' },
    video: { ko: '영상', en: 'Footage' },
    pricing: { ko: '요금제', en: 'Pricing' },
    license: { ko: '라이선스', en: 'License' },
    admin: { ko: '관리자', en: 'Admin' },
    mypage: { ko: '마이페이지', en: 'My Page' },
    logout: { ko: '로그아웃', en: 'Log Out' },
    login: { ko: '로그인', en: 'Log In' },
  },
  common: {
    free: { ko: '무료', en: 'Free' },
    loading: { ko: '불러오는 중…', en: 'Loading…' },
    all: { ko: '전체', en: 'All' },
    empty: { ko: '등록된 콘텐츠가 없습니다.', en: 'No content yet.' },
    previewSoon: { ko: '미리듣기 준비 중', en: 'Preview coming soon' },
    downloadFail: { ko: '다운로드에 실패했습니다.', en: 'Download failed.' },
  },
  home: {
    heroTitle: { ko: '한국형 영상·사운드 스톡 플랫폼', en: 'Authentic Korean Stock, Straight from Korea' },
    heroSub: {
      ko: '광고, 홍보, 유튜브, 숏폼 콘텐츠 제작을 위한 음악·효과음·영상 소스',
      en: 'Music, sound effects and footage for ads, YouTube and short-form content — recorded and filmed in Korea',
    },
    searchPlaceholder: { ko: '원하는 콘텐츠를 검색하세요', en: 'Search for the content you need' },
    searchBtn: { ko: '검색', en: 'Search' },
    heroHint: {
      ko: '예: 한옥, 전통시장, 한식, 도시야경, 감성 BGM, 발걸음, 자연음',
      en: 'e.g. hanok, traditional market, K-food, city night, emotional BGM, footsteps, nature ambience',
    },
    latestMusic: { ko: '최신 음악', en: 'Latest Music' },
    latestSfx: { ko: '최신 효과음', en: 'Latest Sound Effects' },
    latestVideo: { ko: '최신 영상', en: 'Latest Footage' },
    viewAll: { ko: '전체보기 →', en: 'View all →' },
  },
  browse: {
    searchPlaceholder: { ko: '검색어 입력', en: 'Search…' },
    badPath: { ko: '잘못된 경로입니다.', en: 'Invalid path.' },
  },
  detail: {
    notFound: { ko: '콘텐츠를 찾을 수 없습니다.', en: 'Content not found.' },
    category: { ko: '분류', en: 'Category' },
    duration: { ko: '길이', en: 'Duration' },
    format: { ko: '파일 형식', en: 'Format' },
    bpm: { ko: 'BPM', en: 'BPM' },
    resolution: { ko: '해상도', en: 'Resolution' },
    mood: { ko: '분위기', en: 'Mood' },
    uploaded: { ko: '업로드일', en: 'Uploaded' },
    license: { ko: '라이선스', en: 'License' },
    licenseVal: { ko: '상업적 이용 가능', en: 'Commercial use allowed' },
    buyNote: { ko: '구매 시 상업적 이용 라이선스가 발급됩니다.', en: 'A commercial-use license is issued upon purchase.' },
    freeDownload: { ko: '무료 다운로드', en: 'Free Download' },
    buyNow: { ko: '바로 구매', en: 'Buy Now' },
    viewLicense: { ko: '라이선스 확인', en: 'View License' },
  },
  pricing: {
    title: { ko: '요금제', en: 'Pricing' },
    sub: { ko: '현재는 개별 구매로 운영되며, 구독제는 준비 중입니다.', en: 'Currently pay-per-item; subscription plans are coming soon.' },
    freeName: { ko: '무료회원', en: 'Free' },
    freeDesc: { ko: '가입만 하면 바로 시작', en: 'Just sign up to get started' },
    freePrice: { ko: '0원', en: '₩0' },
    freeF1: { ko: '전체 콘텐츠 미리듣기·미리보기', en: 'Preview all content' },
    freeF2: { ko: '무료 콘텐츠 다운로드', en: 'Download free content' },
    payName: { ko: '개별 구매', en: 'Pay Per Item' },
    payDesc: { ko: '필요한 콘텐츠만 골라서 결제', en: 'Buy only what you need' },
    payPrice: { ko: '2,900원~', en: 'from ₩2,900' },
    payUnit: { ko: ' /건', en: ' /item' },
    payF1: { ko: '음악·효과음·영상 개별 구매', en: 'Buy music, SFX and footage individually' },
    payF2: { ko: '구매 후 영구 사용', en: 'Perpetual use after purchase' },
    payF3: { ko: '상업적 이용 라이선스 발급', en: 'Commercial-use license issued' },
    payF4: { ko: '재다운로드 기한 없음', en: 'No re-download expiry' },
    popular: { ko: '인기', en: 'Most Popular' },
    subName: { ko: '크리에이터 월구독', en: 'Creator Monthly' },
    subDesc: { ko: '월정액 무제한 다운로드', en: 'Unlimited monthly downloads' },
    subPrice: { ko: '준비 중', en: 'Coming soon' },
    subF1: { ko: '음악·효과음 무제한', en: 'Unlimited music & SFX' },
    subF2: { ko: '영상 월 10건', en: '10 footage clips / month' },
    entName: { ko: '기업 라이선스', en: 'Enterprise' },
    entDesc: { ko: '대행사·기업 홍보팀 맞춤', en: 'For agencies & corporate teams' },
    entPrice: { ko: '별도 협의', en: 'Custom' },
    entF1: { ko: '클라이언트 납품 라이선스', en: 'Client-delivery license' },
    entF2: { ko: '대량 구매·맞춤 제작', en: 'Bulk & custom production' },
    entF3: { ko: '문의: hueann1@naver.com', en: 'Contact: hueann1@naver.com' },
  },
  license: {
    title: { ko: '라이선스', en: 'License' },
    sub: { ko: '구매 콘텐츠의 사용 범위를 확인하세요.', en: 'Review how your purchased content can be used.' },
    okTitle: { ko: '사용 가능 범위', en: 'Permitted Use' },
    ok1: { ko: '유튜브·SNS·숏폼 영상', en: 'YouTube, social & short-form video' },
    ok2: { ko: 'TV·온라인 광고', en: 'TV & online advertising' },
    ok3: { ko: '기업 홍보영상·IR 자료', en: 'Corporate films & IR materials' },
    ok4: { ko: '앱·웹사이트·게임 삽입', en: 'Apps, websites & games' },
    ok5: { ko: '오프라인 매장·전시 상영', en: 'In-store & exhibition playback' },
    comTitle: { ko: '상업적 이용', en: 'Commercial Use' },
    com1: { ko: '수익 창출 콘텐츠 사용 가능', en: 'Usable in monetized content' },
    com2: { ko: '전 세계 사용 가능', en: 'Worldwide usage' },
    com3: { ko: '사용 기간 제한 없음', en: 'No time limit' },
    comNote: { ko: '* 대행 납품(클라이언트 프로젝트)은 기업 라이선스 문의', en: '* For client-delivery projects, contact us about Enterprise licensing' },
    noTitle: { ko: '금지사항', en: 'Not Allowed' },
    no1: { ko: '원본 파일 재판매·재배포', en: 'Reselling or redistributing source files' },
    no2: { ko: '콘텐츠 자체를 상품화', en: 'Making the content itself a product' },
    no3: { ko: 'AI 학습 데이터로 사용', en: 'Use as AI training data' },
    no4: { ko: '불법·혐오 콘텐츠 사용', en: 'Use in illegal or hateful content' },
    no5: { ko: '상표·로고로 등록', en: 'Registering as a trademark or logo' },
    noticeTitle: { ko: '저작권 안내', en: 'Copyright Notice' },
    noticeBody: {
      ko: '모든 콘텐츠의 저작권은 주식회사 휴앤(스톡코리아) 및 원저작자에게 있으며, 구매 시 부여되는 것은 저작권이 아닌 사용권(라이선스)입니다. 구매별 라이선스 번호는 마이페이지에서 확인할 수 있습니다. 사용 범위가 불확실한 경우 hueann1@naver.com으로 문의해 주세요.',
      en: 'All content is copyrighted by Hueann Co., Ltd. (Stockorea) and the original creators. A purchase grants a usage license, not copyright. Your per-purchase license number is available on My Page. If usage scope is unclear, contact hueann1@naver.com.',
    },
  },
  login: {
    loginTitle: { ko: '로그인', en: 'Log In' },
    signupTitle: { ko: '회원가입', en: 'Sign Up' },
    loginSub: { ko: '스톡코리아에 오신 것을 환영합니다.', en: 'Welcome to Stockorea.' },
    signupSub: { ko: '무료로 가입하고 콘텐츠를 미리 들어보세요.', en: 'Sign up free and start previewing content.' },
    email: { ko: '이메일', en: 'Email' },
    password: { ko: '비밀번호', en: 'Password' },
    pwPlaceholder: { ko: '6자 이상', en: 'At least 6 characters' },
    loginBtn: { ko: '로그인', en: 'Log In' },
    signupBtn: { ko: '가입하기', en: 'Sign Up' },
    noAccount: { ko: '계정이 없으신가요?', en: 'No account yet?' },
    hasAccount: { ko: '이미 계정이 있으신가요?', en: 'Already have an account?' },
    toSignup: { ko: '회원가입', en: 'Sign up' },
    toLogin: { ko: '로그인', en: 'Log in' },
    errLogin: { ko: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.', en: 'Login failed. Please check your email and password.' },
    errExists: { ko: '이미 가입된 이메일입니다.', en: 'This email is already registered.' },
    errSignup: { ko: '가입에 실패했습니다: ', en: 'Sign-up failed: ' },
    confirmSent: { ko: '가입 확인 메일을 보냈습니다. 메일함에서 인증 후 로그인해 주세요.', en: 'A confirmation email has been sent. Please verify, then log in.' },
  },
  mypage: {
    title: { ko: '마이페이지', en: 'My Page' },
    paidOk: { ko: '결제가 완료되었습니다. 아래에서 다운로드하세요.', en: 'Payment complete. Download below.' },
    sectionTitle: { ko: '구매내역 · 다운로드 · 라이선스', en: 'Purchases · Downloads · Licenses' },
    emptyMine: { ko: '아직 구매한 콘텐츠가 없습니다.', en: 'You have not purchased any content yet.' },
    thDate: { ko: '구매일', en: 'Date' },
    thItem: { ko: '콘텐츠', en: 'Item' },
    thType: { ko: '분류', en: 'Type' },
    thAmount: { ko: '금액', en: 'Amount' },
    thLicense: { ko: '라이선스 번호', en: 'License No.' },
    commercial: { ko: '상업적 이용', en: 'Commercial' },
    download: { ko: '다운로드', en: 'Download' },
    noticeTitle: { ko: '라이선스 안내', en: 'License Info' },
    noticeBody: {
      ko: '위 라이선스 번호가 구매 증빙이며, 상업적 프로젝트에 사용 시 번호를 기록해 두시면 됩니다. 증명서(PDF) 발급이 필요하시면 고객센터(hueann1@naver.com)로 요청해 주세요.',
      en: 'The license number above is your proof of purchase — keep it on record when using the content in commercial projects. For a PDF certificate, contact hueann1@naver.com.',
    },
  },
  checkout: {
    title: { ko: '결제하기', en: 'Checkout' },
    includesLicense: { ko: '상업적 이용 라이선스 포함', en: 'Includes commercial-use license' },
    amount: { ko: '결제 금액', en: 'Total' },
    payCard: { ko: '카드로 결제', en: 'Pay by Card' },
    loadingModule: { ko: '결제 모듈 로딩 중…', en: 'Loading payment module…' },
    note: { ko: '결제 완료 시 마이페이지에서 바로 다운로드할 수 있습니다.', en: 'After payment, download instantly from My Page.' },
    orderFail: { ko: '주문 생성 실패: ', en: 'Failed to create order: ' },
    reqFail: { ko: '결제 요청에 실패했습니다.', en: 'Payment request failed.' },
    failTitle: { ko: '결제 실패', en: 'Payment Failed' },
    failDefault: { ko: '결제가 완료되지 않았습니다.', en: 'Your payment was not completed.' },
    backHome: { ko: '홈으로 돌아가기', en: 'Back to Home' },
  },
  footer: {
    company: { ko: '주식회사 휴앤', en: 'Hueann Co., Ltd.' },
    bizNo: { ko: '사업자등록번호 468-81-02372', en: 'Business Reg. No. 468-81-02372' },
    address: { ko: '전라북도 전주시 완산구 홍산중앙로 47, 602호', en: '#602, 47 Hongsan-jungang-ro, Wansan-gu, Jeonju, Korea' },
    contentHead: { ko: '콘텐츠', en: 'Content' },
    guideHead: { ko: '이용안내', en: 'Guide' },
    guideLicense: { ko: '라이선스 정책', en: 'License Policy' },
  },
};

// ─── Context ──────────────────────────────────────────────
const LangContext = createContext({ lang: 'ko', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('ko');

  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null;
    if (saved === 'en' || saved === 'ko') setLangState(saved);
  }, []);

  function setLang(next) {
    setLangState(next);
    try { localStorage.setItem('lang', next); } catch {}
    if (typeof document !== 'undefined') document.documentElement.lang = next;
  }

  function t(path) {
    const node = path.split('.').reduce((o, k) => (o ? o[k] : undefined), DICT);
    if (!node) return path;
    return node[lang] ?? node.ko ?? path;
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// ─── 콘텐츠 헬퍼 ──────────────────────────────────────────
export function typeLabel(type, lang) {
  return (TYPE_LABEL[lang] || TYPE_LABEL.ko)[type] || type;
}
export function catLabel(cat, lang) {
  if (lang === 'en') return CATEGORY_LABEL[cat] || cat;
  return cat;
}
export function assetTitle(asset, lang) {
  return lang === 'en' ? (asset.title_en || asset.title) : asset.title;
}
export function price(n, lang) {
  if (n === 0) return lang === 'en' ? 'Free' : '무료';
  return lang === 'en'
    ? '₩' + Number(n).toLocaleString('en-US')
    : Number(n).toLocaleString('ko-KR') + '원';
}
