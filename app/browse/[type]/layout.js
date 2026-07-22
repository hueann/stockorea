const T = {
  music: { label: '음악', desc: '광고·유튜브·숏폼 제작을 위한 한국형 로열티 프리 음악(BGM)·국악 감성 음악' },
  sfx: { label: '효과음', desc: '한국의 일상과 현장에서 직접 녹음한 자연음·도시음·전통시장 등 리얼 효과음' },
  video: { label: '영상', desc: '4K로 촬영한 한국 도시·전통문화·자연·음식 스톡 영상(풋티지)' },
};

export async function generateMetadata({ params }) {
  const t = T[params.type];
  if (!t) return {};
  return {
    title: t.label,
    description: `${t.desc} — 스톡코리아. 미리듣기 후 바로 다운로드, 상업적 이용 가능.`,
    alternates: { canonical: `/browse/${params.type}` },
  };
}

export default function BrowseLayout({ children }) {
  return children;
}
