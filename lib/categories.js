export const TYPES = {
  music: { label: '음악', unit: '곡' },
  sfx: { label: '효과음', unit: '개' },
  video: { label: '영상', unit: '개' },
};

export const CATEGORIES = {
  music: ['광고음악', '유튜브 BGM', '숏폼 음악', '한국 감성 음악', '기업용 음악'],
  sfx: ['자연음', '도시음', '음식음', '생활음', '한국 로컬 사운드', '광고 효과음'],
  video: ['한국 도시', '전통문화', '음식', '자연', '산업·현장', '숏폼 영상'],
};

export const GRADIENTS = [
  'linear-gradient(135deg,#1a56db,#60a5fa)',
  'linear-gradient(135deg,#7f1d1d,#dc8a5f)',
  'linear-gradient(135deg,#14532d,#4ade80)',
  'linear-gradient(135deg,#7c2d12,#fb923c)',
  'linear-gradient(135deg,#0f172a,#475569)',
  'linear-gradient(135deg,#7c3aed,#c084fc)',
  'linear-gradient(135deg,#0c4a6e,#38bdf8)',
];

export function gradientFor(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function won(n) {
  return n === 0 ? '무료' : Number(n).toLocaleString('ko-KR') + '원';
}
