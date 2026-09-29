import Logo from './Logo';

// 미리보기 위에 STOCKOREA 로고를 대각선 타일 패턴으로 반투명 오버레이 (무단 사용 방지)
export default function Watermark({ tiles = 48 }) {
  return (
    <div className="wm-overlay" aria-hidden="true">
      <div className="wm-grid">
        {Array.from({ length: tiles }).map((_, i) => (
          <span className="wm-logo" key={i}><Logo white /></span>
        ))}
      </div>
    </div>
  );
}
