/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 이 프로젝트는 별도 ESLint 설정이 없어 배포 빌드의 lint 단계 오류를 무시
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
