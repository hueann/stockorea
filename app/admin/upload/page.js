'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabaseBrowser';
import { uploadFile } from '@/lib/uploadClient';
import { CATEGORIES } from '@/lib/categories';

const empty = {
  type: 'music', title: '', title_en: '', description: '', category: '',
  subcategory: '', mood: '', tags: '', duration: '', bpm: '', resolution: '',
  format: 'WAV / MP3', price: 9900,
};

export default function AdminUpload() {
  const [form, setForm] = useState(empty);
  const [original, setOriginal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [progress, setProgress] = useState('');
  const router = useRouter();

  useEffect(() => {
    setForm((f) => ({ ...f, category: CATEGORIES[f.type][0] }));
  }, [form.type]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    if (!original) { setErr('원본 파일을 선택해 주세요.'); return; }
    setBusy(true);
    try {
      const { data: { session } } = await sb().auth.getSession();
      // 파일은 브라우저에서 스토리지로 직접 업로드 (Vercel 4.5MB 본문 제한 우회)
      setProgress('파일 업로드 중… (파일 크기에 따라 시간이 걸릴 수 있습니다)');
      const file_path = await uploadFile('originals', form.type, original);
      const preview_path = preview ? await uploadFile('previews', form.type, preview) : null;

      setProgress('콘텐츠 등록 중…');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, file_path, preview_path }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || '업로드 실패');
      router.push('/admin');
    } catch (e2) {
      setErr(e2.message);
      setBusy(false);
      setProgress('');
    }
  }

  return (
    <div className="container">
      <div className="form-wrap wide">
        <h2 className="page-title">콘텐츠 업로드</h2>
        <p className="page-sub">원본은 비공개 저장소에, 미리보기는 공개 저장소에 업로드됩니다.</p>
        {err && <div className="error-msg">{err}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>콘텐츠 유형</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="music">음악</option>
              <option value="sfx">효과음</option>
              <option value="video">영상</option>
            </select>
          </div>
          <div className="form-group">
            <label>카테고리</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES[form.type].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label>제목 (국문) *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="예: 전통시장 현장음 01" /></div>
          <div className="form-group"><label>제목 (영문, SEO)</label>
            <input value={form.title_en} onChange={(e) => set('title_en', e.target.value)} placeholder="예: Korean Traditional Market Ambience 01" /></div>
          <div className="form-group"><label>설명</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="form-group"><label>태그 (쉼표 구분, 국문+영문 권장)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="전통시장, 현장음, market, ambience" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>분위기</label>
              <input value={form.mood} onChange={(e) => set('mood', e.target.value)} placeholder="활기, 현장감" /></div>
            <div className="form-group"><label>길이</label>
              <input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="1:45" /></div>
            {form.type === 'music' ? (
              <div className="form-group"><label>BPM</label>
                <input type="number" value={form.bpm} onChange={(e) => set('bpm', e.target.value)} placeholder="120" /></div>
            ) : form.type === 'video' ? (
              <div className="form-group"><label>해상도</label>
                <input value={form.resolution} onChange={(e) => set('resolution', e.target.value)} placeholder="4K" /></div>
            ) : <div />}
            <div className="form-group"><label>파일 형식 표기</label>
              <input value={form.format} onChange={(e) => set('format', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>판매가 (원, 0 = 무료)</label>
            <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} min={0} required /></div>
          <div className="form-group"><label>원본 파일 * (구매자에게 제공)</label>
            <input type="file" onChange={(e) => setOriginal(e.target.files[0])} required />
            <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>※ 파일당 최대 50MB (영상은 압축 권장).</p></div>
          <div className="form-group">
            <label>미리보기 파일 (음악·효과음: 워터마크 MP3 / 영상: 저해상도 MP4)</label>
            <input type="file" onChange={(e) => setPreview(e.target.files[0])} />
            <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>
              ※ 비워두면 미리듣기/미리보기 없이 게시됩니다. 원본 유출 방지를 위해 원본과 다른 파일을 권장합니다.
            </p>
          </div>
          {progress && <div className="ok-msg">{progress}</div>}
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={busy}>
            {busy ? '업로드 중…' : '업로드 및 게시'}
          </button>
        </form>
      </div>
    </div>
  );
}
