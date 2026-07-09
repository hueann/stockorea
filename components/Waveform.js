'use client';
import { useEffect, useRef, useState } from 'react';

// 디코딩한 파형 피크를 메모리에 캐시 (재방문/리렌더 시 재다운로드 방지)
const peakCache = new Map();

export default function Waveform({
  src,
  height = 84,
  bars = 200,
  gap = 2,
  radius = 2,
  compact = false,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const audioRef = useRef(null);
  const [peaks, setPeaks] = useState(() => peakCache.get(src) || null);
  const [status, setStatus] = useState(() => (peakCache.has(src) ? 'ready' : 'idle')); // idle|loading|ready|failed
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [hover, setHover] = useState(null);     // 0..1 | null
  const [tick, setTick] = useState(0);

  // 뷰포트 진입 시에만 디코딩 (목록 성능)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect(); } },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 오디오 디코딩 → 피크 계산
  useEffect(() => {
    let cancelled = false;
    if (!src || !visible) return;
    if (peakCache.has(src)) { setPeaks(peakCache.get(src)); setStatus('ready'); return; }
    setStatus('loading');
    (async () => {
      try {
        const res = await fetch(src);
        const arr = await res.arrayBuffer();
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const audioBuf = await ctx.decodeAudioData(arr);
        ctx.close();
        const raw = audioBuf.getChannelData(0);
        const block = Math.max(1, Math.floor(raw.length / bars));
        const out = new Array(bars);
        let max = 0;
        for (let i = 0; i < bars; i++) {
          let peak = 0;
          const start = i * block;
          for (let j = 0; j < block; j++) { const v = Math.abs(raw[start + j] || 0); if (v > peak) peak = v; }
          out[i] = peak;
          if (peak > max) max = peak;
        }
        for (let i = 0; i < bars; i++) out[i] = max ? Math.pow(out[i] / max, 0.85) : 0;
        if (cancelled) return;
        peakCache.set(src, out);
        setPeaks(out); setStatus('ready');
      } catch (e) {
        if (!cancelled) setStatus('failed');
      }
    })();
    return () => { cancelled = true; };
  }, [src, bars, visible]);

  // 캔버스 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const data = peaks || new Array(bars).fill(0.08);
    const n = data.length;
    const step = w / n;
    const bw = Math.max(1, step - gap);
    const mid = h / 2;
    const playedIdx = progress * n;
    const hoverIdx = hover != null ? hover * n : -1;

    // 색상 그라데이션 (재생분: 밝은 브랜드 블루)
    const gPlayed = ctx.createLinearGradient(0, 0, 0, h);
    gPlayed.addColorStop(0, '#5b9bff');
    gPlayed.addColorStop(1, '#1a56db');
    const base = '#cbd5e8';
    const preview = '#9dc0ff';

    for (let i = 0; i < n; i++) {
      const bh = Math.max(2, data[i] * (h - 2));
      const x = i * step + (step - bw) / 2;
      const y = mid - bh / 2;
      let fill = base;
      if (i < playedIdx) fill = gPlayed;
      else if (hoverIdx > playedIdx && i < hoverIdx) fill = preview;   // 앞으로 시크 프리뷰
      else if (hoverIdx >= 0 && hoverIdx <= playedIdx && i >= hoverIdx && i < playedIdx) fill = preview;
      ctx.fillStyle = fill;
      const r = Math.min(radius, bw / 2, bh / 2);
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, bw, bh, r); ctx.fill(); }
      else ctx.fillRect(x, y, bw, bh);
    }

    // 호버 커서 라인
    if (hover != null) {
      const hx = hover * w;
      ctx.strokeStyle = 'rgba(26,86,219,.55)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hx, 0); ctx.lineTo(hx, h); ctx.stroke();
    }
  }, [peaks, progress, hover, tick, bars, height, gap, radius]);

  // 리사이즈 리드로우
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setTick((t) => t + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function toggle(e) {
    e.preventDefault(); e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause(); else a.play();
  }
  function ratioFromEvent(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  }
  function seek(e) {
    e.preventDefault(); e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    const ratio = ratioFromEvent(e);
    if (a.duration) { a.currentTime = ratio * a.duration; setProgress(ratio); }
  }

  return (
    <div ref={wrapRef} className={`wave${compact ? ' wave-compact' : ''}`}>
      <button type="button" className="play-btn" onClick={toggle} aria-label={playing ? '일시정지' : '재생'}>
        {playing ? '❚❚' : '▶'}
      </button>
      <div
        className="wave-canvas-wrap"
        style={{ height }}
        onClick={seek}
        onMouseMove={(e) => setHover(ratioFromEvent(e))}
        onMouseLeave={() => setHover(null)}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }} />
        {status !== 'ready' && (
          <span className="wave-hint">{status === 'failed' ? '파형을 불러올 수 없습니다' : '파형 분석 중…'}</span>
        )}
      </div>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => { const a = e.currentTarget; if (a.duration) setProgress(a.currentTime / a.duration); }}
      />
    </div>
  );
}
