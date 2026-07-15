'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sb } from '@/lib/supabaseBrowser';
import { uploadFile } from '@/lib/uploadClient';
import { CATEGORIES } from '@/lib/categories';

export default function EditAsset({ params }) {
  const id = params.id;
  const router = useRouter();
  const [role, setRole] = useState(undefined);
  const [form, setForm] = useState(null);
  const [files, setFiles] = useState({ original: null, preview: null, thumbnail: null });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    sb().auth.getUser().then(async ({ data }) => {
      if (!data?.user) { router.push(`/login?next=/admin/contents/${id}/edit`); return; }
      const { data: p } = await sb().from('profiles').select('role').eq('id', data.user.id).single();
      setRole(p?.role || 'user');
    });
  }, [id]);

  useEffect(() => {
    if (role !== 'admin') return;
    sb().from('assets').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { setErr('콘텐츠를 찾을 수 없습니다.'); return; }
      setForm({
        ...data,
        tags: (data.tags || []).join(', '),
        title_en: data.title_en || '', description: data.description || '',
        subcategory: data.subcategory || '', mood: data.mood || '',
        duration: data.duration || '', bpm: data.bpm ?? '', resolution: data.resolution || '',
        format: data.format || '', license: data.license || 'commercial',
      });
    });
  }, [role, id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function setType(v) {
    setForm((f) => {
      const cats = CATEGORIES[v];
      return { ...f, type: v, category: cats.includes(f.category) ? f.category : cats[0] };
    });
  }

  async function save(e) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      const { data: { session } } = await sb().auth.getSession();
      const payload = {};
      ['type', 'title', 'title_en', 'description', 'category', 'subcategory', 'mood', 'tags',
        'duration', 'bpm', 'resolution', 'format', 'price', 'license', 'status']
        .forEach((k) => { payload[k] = form[k] ?? ''; });

      // 파일은 브라우저에서 스토리지로 직접 업로드 (Vercel 본문 제한 우회)
      if (files.original || files.preview || files.thumbnail) setMsg('파일 업로드 중… (크기에 따라 시간이 걸릴 수 있습니다)');
      if (files.original) payload.file_path = await uploadFile('originals', form.type, files.original);
      if (files.preview) payload.preview_path = await uploadFile('previews', form.type, files.preview);
      if (files.thumbnail) payload.thumbnail_path = await uploadFile('previews', form.type, files.thumbnail);

      const res = await fetch(`/api/admin/assets/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || '수정 실패');
      router.push('/admin');
    } catch (e2) { setErr(e2.message); setBusy(false); setMsg(null); }
  }

  async function remove() {
    if (!confirm('이 콘텐츠를 영구 삭제할까요? (스토리지 파일도 함께 삭제됩니다)')) return;
    setErr(null); setBusy(true);
    try {
      const { data: { session } } = await sb().auth.getSession();
      const res = await fetch(`/api/admin/assets/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || '삭제 실패');
      router.push('/admin');
    } catch (e2) { setErr(e2.message); setBusy(false); }
  }

  if (role === undefined) return <div className="container"><div className="empty">확인 중…</div></div>;
  if (role !== 'admin') return <div className="container"><div className="empty">관리자 권한이 필요합니다.</div></div>;
  if (err && !form) return <div className="container"><div className="empty">{err}</div></div>;
  if (!form) return <div className="container"><div className="empty">불러오는 중…</div></div>;

  return (
    <div className="container">
      <div className="form-wrap wide">
        <h2 className="page-title">콘텐츠 수정</h2>
        <p className="page-sub">
          <Link href="/admin" style={{ color: 'var(--primary)' }}>← 콘텐츠 관리로</Link>
        </p>
        {err && <div className="error-msg">{err}</div>}
        {msg && <div className="ok-msg">{msg}</div>}
        <form onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>유형</label>
              <select value={form.type} onChange={(e) => setType(e.target.value)}>
                <option value="music">음악</option><option value="sfx">효과음</option><option value="video">영상</option>
              </select></div>
            <div className="form-group"><label>카테고리</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES[form.type].map((c) => <option key={c}>{c}</option>)}
              </select></div>
          </div>
          <div className="form-group"><label>제목 (국문) *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} required /></div>
          <div className="form-group"><label>제목 (영문)</label>
            <input value={form.title_en} onChange={(e) => set('title_en', e.target.value)} /></div>
          <div className="form-group"><label>설명</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="form-group"><label>태그 (쉼표 구분)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>분위기</label>
              <input value={form.mood} onChange={(e) => set('mood', e.target.value)} /></div>
            <div className="form-group"><label>길이</label>
              <input value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="1:45" /></div>
            {form.type === 'music' ? (
              <div className="form-group"><label>BPM</label>
                <input type="number" value={form.bpm} onChange={(e) => set('bpm', e.target.value)} /></div>
            ) : form.type === 'video' ? (
              <div className="form-group"><label>해상도</label>
                <input value={form.resolution} onChange={(e) => set('resolution', e.target.value)} placeholder="4K" /></div>
            ) : <div />}
            <div className="form-group"><label>파일 형식 표기</label>
              <input value={form.format} onChange={(e) => set('format', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>판매가 (원, 0=무료)</label>
              <input type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} required /></div>
            <div className="form-group"><label>라이선스</label>
              <select value={form.license} onChange={(e) => set('license', e.target.value)}>
                <option value="commercial">표준 (상업적 이용)</option>
                <option value="extended">확장 (기업/대행 납품)</option>
              </select></div>
            <div className="form-group"><label>공개 상태</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">판매중</option><option value="hidden">숨김</option><option value="pending">검수 대기</option>
              </select></div>
          </div>

          <h3 className="section-title" style={{ fontSize: 16, marginTop: 8 }}>파일 (교체할 때만 선택 — 비우면 기존 유지)</h3>
          <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: -8, marginBottom: 8 }}>※ 파일당 최대 50MB (영상은 압축 권장). 초과 시 업로드가 거부됩니다.</p>
          <FileRow label="원본 파일 (originals)" current={form.file_path} onChange={(f) => setFiles((s) => ({ ...s, original: f }))} />
          <FileRow label="미리보기 파일 (previews)" current={form.preview_path} onChange={(f) => setFiles((s) => ({ ...s, preview: f }))} />
          <FileRow label="썸네일 (previews)" current={form.thumbnail_path} onChange={(f) => setFiles((s) => ({ ...s, thumbnail: f }))} />

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={busy}>{busy ? '저장 중…' : '수정 저장'}</button>
            <button type="button" className="btn btn-lg" style={{ color: '#b91c1c', borderColor: '#fecaca' }} disabled={busy} onClick={remove}>삭제</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FileRow({ label, current, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 6 }}>
        현재: {current ? <code>{current}</code> : <em>없음</em>}
      </div>
      <input type="file" onChange={(e) => onChange(e.target.files[0] || null)} />
    </div>
  );
}
