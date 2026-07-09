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

// ─── 브라우즈 서브카테고리 설명 ───────────────────────────
export const SUBCATS = {
  music: {
    ko: [['광고음악', '밝은 광고 · 감성 광고 · 프리미엄 광고 · 기업 홍보'], ['유튜브 BGM', '브이로그 · 여행 · 리뷰 · 정보 콘텐츠'], ['숏폼 음악', '15초 · 30초 · 릴스 · 쇼츠 · 틱톡용'], ['한국 감성', '국악 기반 · 한옥 감성 · 전통 악기'], ['기업용', '프레젠테이션 · 브랜드 영상 · 행사 영상']],
    en: [['Advertising', 'bright · emotional · premium · promo'], ['YouTube BGM', 'vlog · travel · review · informational'], ['Short-form', '15s · 30s · Reels · Shorts · TikTok'], ['Korean Traditional', 'gugak-based · hanok mood · traditional instruments'], ['Corporate', 'presentation · brand film · events']],
  },
  sfx: {
    ko: [['자연음', '비 · 바람 · 파도 · 숲 · 새소리'], ['도시음', '거리 · 지하철 · 버스 · 시장 · 카페'], ['음식음', '조리음 · 칼질 · 끓는 소리 · 튀김'], ['생활음', '문소리 · 발걸음 · 종이 · 키보드'], ['한국 로컬', '전통시장 · 한옥 · 사찰 · 농촌 · 축제'], ['광고 효과음', '전환음 · 클릭음 · 알림음 · 로고 사운드']],
    en: [['Nature', 'rain · wind · waves · forest · birds'], ['City', 'streets · subway · bus · market · cafe'], ['Food', 'cooking · chopping · boiling · frying'], ['Daily Life', 'doors · footsteps · paper · keyboard'], ['Korean Local', 'traditional market · hanok · temple · countryside · festival'], ['Ad SFX', 'transitions · clicks · notifications · logo sounds']],
  },
  video: {
    ko: [['한국 도시', '서울 · 전주 · 부산 · 인천 · 야경 · 거리'], ['전통문화', '한옥 · 한복 · 전통시장 · 사찰 · 공예'], ['음식', '한식 조리 · 식재료 · 음식 클로즈업'], ['자연', '바다 · 산 · 숲 · 계절 · 하늘'], ['산업·현장', '공방 · 제조 · 축산 · 농업 · 물류'], ['숏폼', '9:16 세로 영상 · SNS 광고용 클립']],
    en: [['Korean Cities', 'Seoul · Jeonju · Busan · Incheon · night views · streets'], ['Traditional Culture', 'hanok · hanbok · markets · temples · crafts'], ['Food', 'Korean cooking · ingredients · close-ups'], ['Nature', 'sea · mountains · forest · seasons · sky'], ['Industry', 'workshops · manufacturing · farming · logistics'], ['Short-form', '9:16 vertical · SNS ad clips']],
  },
};

// ─── 고객센터 FAQ ─────────────────────────────────────────
export const FAQ_DATA = {
  ko: [
    { cat: '결제', q: '어떤 결제 수단을 지원하나요?', a: '신용/체크카드, 계좌이체, 간편결제(카카오페이·네이버페이·토스)를 지원합니다. 해외결제는 추후 지원 예정입니다. 기업회원은 세금계산서 발행 후 계좌이체도 가능합니다.' },
    { cat: '결제', q: '구독은 언제든 해지할 수 있나요?', a: '네, 마이페이지 > 구독상태에서 언제든 해지할 수 있으며, 남은 기간 동안은 계속 이용 가능합니다.' },
    { cat: '다운로드', q: '다운로드 횟수 제한이 있나요?', a: '개별 구매는 횟수 제한이 없습니다. 크리에이터 월구독은 음악·효과음 무제한, 영상은 월 10건까지 다운로드할 수 있습니다.' },
    { cat: '다운로드', q: '구매한 파일을 다시 받을 수 있나요?', a: '마이페이지 > 다운로드 내역에서 언제든 재다운로드할 수 있습니다.' },
    { cat: '환불', q: '환불 규정이 어떻게 되나요?', a: '다운로드하지 않은 개별 구매 건은 7일 이내 전액 환불됩니다. 다운로드 이후에는 디지털 콘텐츠 특성상 환불이 제한되며, 파일 하자 시 교환 또는 환불해 드립니다.' },
    { cat: '사용 문의', q: '구독 해지 후에도 다운로드한 콘텐츠를 쓸 수 있나요?', a: '네, 구독 기간 중 다운로드한 콘텐츠는 해지 후에도 영구적으로 사용할 수 있습니다.' },
    { cat: '사용 문의', q: '클라이언트 프로젝트에 사용해도 되나요?', a: '개별 구매·크리에이터 월구독은 본인(자사) 프로젝트에 한하며, 대행 납품에는 비즈니스 구독 이상의 라이선스가 필요합니다.' },
  ],
  en: [
    { cat: 'Payment', q: 'Which payment methods do you accept?', a: 'Credit/debit cards and major Korean payment services. International cards (Visa, Mastercard) and PayPal support is coming soon. Enterprise clients can pay by invoice and bank transfer.' },
    { cat: 'Payment', q: 'Can I cancel my subscription anytime?', a: 'Yes. You can cancel anytime under My Page > Subscription and keep access until the end of the billing period.' },
    { cat: 'Downloads', q: 'Is there a download limit?', a: 'Pay-per-item purchases have no limit. Creator Monthly includes unlimited music & SFX downloads and 10 footage downloads per month.' },
    { cat: 'Downloads', q: 'Can I re-download purchased files?', a: 'Yes, anytime under My Page > Downloads.' },
    { cat: 'Refunds', q: 'What is the refund policy?', a: 'Undownloaded single purchases are fully refundable within 7 days. After download, refunds are limited due to the nature of digital content, but defective files are always replaced or refunded.' },
    { cat: 'Usage', q: 'Can I keep using downloads after cancelling?', a: 'Yes. Content downloaded during your subscription remains licensed permanently.' },
    { cat: 'Usage', q: 'Can I use content in client projects?', a: 'Pay Per Item and Creator Monthly cover your own projects. Agency deliverables require Business Annual or above.' },
  ],
};

// ─── UI 문구 사전 ─────────────────────────────────────────
const DICT = {
  nav: {
    music: { ko: '음악', en: 'Music' },
    sfx: { ko: '효과음', en: 'SFX' },
    video: { ko: '영상', en: 'Footage' },
    pricing: { ko: '요금제', en: 'Pricing' },
    license: { ko: '라이선스', en: 'License' },
    biz: { ko: '기업문의', en: 'Business' },
    support: { ko: '고객센터', en: 'Support' },
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
    searchAll: { ko: '전체', en: 'All' },
    popularMusic: { ko: '이번 주 인기 음악', en: 'Trending Music This Week' },
    adSfx: { ko: '광고용 효과음', en: 'SFX for Ads' },
    localVideo: { ko: '한국 로컬 영상', en: 'Korean Local Footage' },
    newUploads: { ko: '신규 업로드 콘텐츠', en: 'New Uploads' },
    plansTitle: { ko: '요금제 안내', en: 'Plans' },
    seeDetails: { ko: '자세히 보기 →', en: 'See details →' },
    qcTradition: { ko: '한국전통', en: 'Korean Tradition' },
    qcCity: { ko: '도시', en: 'City' },
    qcNature: { ko: '자연', en: 'Nature' },
    qcFood: { ko: '음식', en: 'Food' },
    qcIndustry: { ko: '산업', en: 'Industry' },
    qcShort: { ko: '숏폼', en: 'Short-form' },
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
    sub: { ko: '필요한 만큼만, 합리적으로. 유료 요금제에는 상업적 이용 라이선스가 포함됩니다.', en: 'Pay only for what you need. All paid plans include a commercial-use license.' },
    popular: { ko: '가장 인기', en: 'Most Popular' },
    // 1) Free
    freeTarget: { ko: '일반 방문자', en: 'Visitors' },
    freeName: { ko: '무료회원', en: 'Free' },
    freeDesc: { ko: '가입만 하면 바로 시작', en: 'Sign up and start right away' },
    freePrice: { ko: '0원', en: '$0' },
    freeF1: { ko: '전체 콘텐츠 미리듣기·미리보기', en: 'Preview all music, SFX & footage' },
    freeF2: { ko: '일부 무료 콘텐츠 다운로드', en: 'Selected free downloads' },
    freeF3: { ko: '찜 목록·검색 기록', en: 'Favorites & search history' },
    freeCta: { ko: '무료 가입', en: 'Join Free' },
    // 2) Pay per item
    payTarget: { ko: '단건 사용자', en: 'One-time users' },
    payName: { ko: '개별 구매', en: 'Pay Per Item' },
    payDesc: { ko: '필요한 콘텐츠만 골라서 결제', en: 'Buy only the content you need' },
    payPrice: { ko: '5,900원~', en: 'from $4.99' },
    payUnit: { ko: ' /건', en: ' /item' },
    payF1: { ko: '음악·효과음·영상 개별 구매', en: 'Buy music, SFX & footage individually' },
    payF2: { ko: '구매 후 영구 사용', en: 'Lifetime usage after purchase' },
    payF3: { ko: '상업적 이용 가능', en: 'Commercial use included' },
    payF4: { ko: '재다운로드 기한 없음', en: 'Unlimited re-downloads' },
    payCta: { ko: '둘러보기', en: 'Browse' },
    // 3) Creator monthly
    subTarget: { ko: '유튜버 · 숏폼 제작자', en: 'YouTubers · short-form creators' },
    subName: { ko: '크리에이터 월구독', en: 'Creator Monthly' },
    subDesc: { ko: '매달 자유롭게 다운로드', en: 'Download freely every month' },
    subPrice: { ko: '29,000원', en: '$21.99' },
    subUnit: { ko: ' /월', en: ' /mo' },
    subF1: { ko: '음악·효과음 무제한 다운로드', en: 'Unlimited music & SFX downloads' },
    subF2: { ko: '영상 월 10건 다운로드', en: '10 footage downloads /mo' },
    subF3: { ko: '상업적 이용 가능', en: 'Commercial use included' },
    subF4: { ko: '신규 콘텐츠 우선 이용', en: 'Early access to new content' },
    subCta: { ko: '구독 시작', en: 'Subscribe' },
    // 4) Business annual
    bizTarget: { ko: '기업 · 광고대행사', en: 'Companies · agencies' },
    bizName: { ko: '비즈니스 구독', en: 'Business Annual' },
    bizDesc: { ko: '연간 결제 시 30% 할인', en: 'Save 30% with yearly billing' },
    bizPrice: { ko: '244,000원', en: '$185' },
    bizUnit: { ko: ' /년', en: ' /yr' },
    bizF1: { ko: '월구독 혜택 전체 포함', en: 'Everything in Creator Monthly' },
    bizF2: { ko: '영상 월 20건 다운로드', en: '20 footage downloads /mo' },
    bizF3: { ko: '클라이언트 납품 라이선스', en: 'Client delivery license' },
    bizF4: { ko: '세금계산서 발행', en: 'Invoice billing' },
    bizCta: { ko: '연간 구독', en: 'Go Annual' },
    // 5) VIP Enterprise
    entTarget: { ko: '반복 구매 기업', en: 'Repeat business buyers' },
    entName: { ko: 'VIP 기업회원', en: 'VIP Enterprise' },
    entDesc: { ko: '대량 구매·맞춤 제작 연계', en: 'Volume purchases & custom production' },
    entPrice: { ko: '별도 협의', en: 'Custom' },
    entF1: { ko: '누적 구매 할인', en: 'Volume discounts' },
    entF2: { ko: '다중 계정(시트) 지원', en: 'Multi-seat accounts' },
    entF3: { ko: '우선 다운로드·맞춤 추천', en: 'Priority downloads & curation' },
    entF4: { ko: '맞춤 제작 의뢰 연계', en: 'Custom production service' },
    entF5: { ko: '전담 매니저 배정', en: 'Dedicated account manager' },
    entCta: { ko: '기업문의', en: 'Contact Us' },
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
    welcome: { ko: '님, 환영합니다.', en: '' },
    scMember: { ko: '회원 등급', en: 'Membership' },
    freeMember: { ko: '무료회원', en: 'Free member' },
    scSpent: { ko: '누적 구매액', en: 'Total spent' },
    scOrders: { ko: '구매 건수', en: 'Purchases' },
    scLicenses: { ko: '보유 라이선스', en: 'Licenses' },
    unit: { ko: '건', en: '' },
    tabPurchases: { ko: '구매내역', en: 'Purchases' },
    tabDownloads: { ko: '다운로드', en: 'Downloads' },
    tabLicenses: { ko: '라이선스', en: 'Licenses' },
    thFormat: { ko: '포맷', en: 'Format' },
    thScope: { ko: '범위', en: 'Scope' },
    thIssued: { ko: '발급일', en: 'Issued' },
    redownload: { ko: '재다운로드', en: 'Re-download' },
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
  biz: {
    title: { ko: '기업문의', en: 'Business Inquiries' },
    sub: { ko: '광고대행사, 기업 홍보팀을 위한 맞춤 플랜과 콘텐츠 제작을 지원합니다.', en: 'Custom plans and content production for ad agencies and corporate PR teams.' },
    type: { ko: '문의 유형', en: 'Inquiry Type' },
    t1: { ko: '광고대행사 제휴', en: 'Ad agency partnership' },
    t2: { ko: '기업 홍보팀 구독', en: 'Corporate PR subscription' },
    t3: { ko: '맞춤 제작 문의 (음악/효과음/영상)', en: 'Custom production (music / SFX / footage)' },
    t4: { ko: '대량 구매 문의', en: 'Volume purchase' },
    t5: { ko: '기타', en: 'Other' },
    company: { ko: '회사명', en: 'Company' },
    companyPh: { ko: '회사명을 입력하세요', en: 'Company name' },
    contact: { ko: '담당자명', en: 'Contact Person' },
    contactPh: { ko: '담당자 이름', en: 'Full name' },
    email: { ko: '이메일', en: 'Email' },
    phone: { ko: '연락처', en: 'Phone' },
    message: { ko: '문의 내용', en: 'Message' },
    messagePh: { ko: '필요한 콘텐츠 종류, 사용 목적, 예상 규모 등을 알려주세요.', en: 'Tell us about the content you need, intended use and estimated volume.' },
    submit: { ko: '문의 보내기', en: 'Send Inquiry' },
    sending: { ko: '전송 중…', en: 'Sending…' },
    success: { ko: '문의가 접수되었습니다. 영업일 기준 1일 내 회신드립니다.', en: 'Your inquiry has been received. We will reply within 1 business day.' },
    fail: { ko: '문의 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.', en: 'Failed to submit your inquiry. Please try again shortly.' },
  },
  support: {
    title: { ko: '고객센터', en: 'Support' },
    sub: { ko: '자주 묻는 질문을 확인하거나 1:1 문의를 남겨주세요. (평일 10:00–18:00)', en: 'Browse FAQs or send us a message. (Weekdays 10:00–18:00 KST)' },
    contactBtn: { ko: '1:1 문의하기', en: 'Contact Support' },
  },
  footer: {
    company: { ko: '주식회사 휴앤', en: 'Hueann Co., Ltd.' },
    bizNo: { ko: '사업자등록번호 468-81-02372', en: 'Business Reg. No. 468-81-02372' },
    mailOrder: { ko: '통신판매업 신고번호 2023-전주완산-0474', en: 'Mail-order Business Report No. 2023-Jeonju Wansan-0474' },
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
