# 스톡코리아 (STOCKOREA) — 운영 사이트

한국형 음악·효과음·영상 스톡 플랫폼 MVP.
Next.js 14 + Supabase(회원·DB·파일저장) + 토스페이먼츠(결제) 구조입니다.

## 포함된 기능

- 회원가입 / 로그인 (이메일)
- 음악·효과음·영상 목록, 카테고리 필터, 검색
- 미리듣기(음악·효과음) / 미리보기(영상) — 원본은 비공개 보관
- 개별 구매 (토스페이먼츠 카드 결제) + 무료 콘텐츠 다운로드
- 결제 완료 시 라이선스 번호 자동 발급
- 마이페이지: 구매내역, 재다운로드, 라이선스 확인
- 관리자: 매출 현황, 콘텐츠 업로드(원본+미리보기), 판매중/숨김 관리
- 요금제·라이선스 안내 페이지

구독제·기업회원·영문 버전은 2차 개발 항목입니다.

---

## 사장님이 직접 해야 하는 일 (순서대로)

### 1단계. Supabase 가입 (무료) — 약 15분

DB, 회원 관리, 파일 저장소를 담당합니다.

1. https://supabase.com 가입 → **New Project** 생성
   - Name: `stockorea`, Region: `Northeast Asia (Seoul)`, DB 비밀번호는 따로 메모
2. 왼쪽 메뉴 **SQL Editor** → 이 폴더의 `supabase/schema.sql` 내용 전체를 붙여넣고 **Run**
   (테이블, 보안 정책, 저장소 버킷이 한 번에 만들어집니다)
3. 왼쪽 메뉴 **Settings > API**에서 아래 3개 값을 복사해 둡니다.
   - `Project URL`
   - `anon public` 키
   - `service_role` 키 (⚠️ 절대 외부 유출 금지)

### 2단계. 프로그램 설치 후 내 컴퓨터에서 실행 — 약 15분

1. Node.js 설치: https://nodejs.org (LTS 버전)
2. 이 폴더(`stockorea-site`)에서 터미널 열기
3. `.env.example` 파일을 복사해서 `.env.local` 로 이름 변경 → 1단계에서 복사한 Supabase 값 3개 입력
   (토스 키는 테스트 키가 이미 들어 있어 그대로 두면 됩니다)
4. 터미널에서 실행:
   ```bash
   npm install
   npm run dev
   ```
5. 브라우저에서 http://localhost:3000 접속 → 사이트가 떠야 정상

### 3단계. 관리자 계정 만들기 — 약 5분

1. 사이트에서 hueann1@naver.com 으로 **회원가입**
   (확인 메일이 오면 인증. 메일 인증을 끄려면 Supabase > Authentication > Providers > Email > "Confirm email" 해제)
2. Supabase **SQL Editor**에서 실행:
   ```sql
   update profiles set role = 'admin' where email = 'hueann1@naver.com';
   ```
3. 사이트 새로고침 → 상단에 **관리자** 메뉴가 생깁니다 → 콘텐츠 업로드 시작

### 4단계. 콘텐츠 업로드

관리자 > 새 콘텐츠 업로드에서:
- **원본 파일**: 구매자가 받을 고품질 파일 (비공개 저장)
- **미리보기 파일**: 워터마크 넣은 MP3 / 저해상도 MP4 (공개 저장)
- 미리보기 파일은 원본과 반드시 다른 파일로 만들어 주세요 (유출 방지)

### 5단계. 인터넷에 공개 (Vercel 배포) — 약 20분

1. https://github.com 가입 → 이 폴더를 저장소로 업로드
   (GitHub Desktop 앱을 쓰면 드래그로 가능)
2. https://vercel.com 가입 (GitHub 계정으로) → **Add New > Project** → 저장소 선택
3. **Environment Variables**에 `.env.local`의 값 6개를 그대로 입력 → Deploy
4. 배포 완료 후 `NEXT_PUBLIC_SITE_URL`을 배포 주소로 수정 (예: `https://stockorea.vercel.app`) → Redeploy

### 6단계. 도메인 연결 (stockorea.com)

1. Vercel 프로젝트 > **Settings > Domains** > `stockorea.com` 추가
2. 도메인 구입처(가비아·후이즈 등) 관리 화면에서 Vercel이 알려주는 DNS 레코드(A 레코드/CNAME) 입력
3. 반영까지 최대 하루 → 이후 `NEXT_PUBLIC_SITE_URL=https://stockorea.com` 으로 변경

### 7단계. 실제 결제 열기 (토스페이먼츠) — 심사 1~2주

지금은 **테스트 결제**만 됩니다(실제 돈이 빠져나가지 않음). 실 결제 전환:

1. https://pay.toss.im 에서 **전자결제 가맹점 신청**
   - 필요 서류: 사업자등록증(468-81-02372), 통장 사본, 신분증
   - 업종: 디지털 콘텐츠 판매
   - ⚠️ 심사에는 운영 중인 사이트 주소가 필요하므로 5~6단계를 먼저 마치세요
2. 심사 승인 후 발급되는 **라이브 클라이언트 키/시크릿 키**를
   Vercel 환경변수 `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`에 교체 → Redeploy
3. 통신판매업 신고(관할 시청/구청 또는 정부24)도 실 판매 전 필수입니다.

---

## 월 운영비 (예상)

| 항목 | 초기 | 규모 성장 시 |
|---|---|---|
| Supabase | 무료 (1GB 저장) | Pro $25/월 (100GB) |
| Vercel | 무료 | Pro $20/월 |
| 도메인 | 연 2~3만원 | 동일 |
| 토스페이먼츠 | 결제 수수료만 (약 3%대) | 동일 |

영상 파일이 많아지면 저장소 용량이 관건입니다. Supabase 무료 1GB → 초기 음원 위주 런칭 후 Pro 전환을 권합니다.

## 문제가 생기면

Claude(Cowork)에 이 폴더를 열고 오류 메시지를 붙여넣으면 바로 수정해 드립니다.
