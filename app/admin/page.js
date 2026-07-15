'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb } from '@/lib/supabaseBrowser';
import { won, TYPES } from '@/lib/categories';

const NAV = [
  { key: 'dash', icon: '📊', label: '대시보드' },
  { key: 'contents', icon: '🗂️', label: '콘텐츠 관리' },
  { key: 'sales', icon: '💳', label: '판매 관리' },
  { key: 'members', icon: '👥', label: '회원 관리' },
  { key: 'biz', icon: '🏢', label: '기업문의 접수' },
  { key: 'seo', icon: '🔍', label: 'SEO 설정' },
];
const typeTag = { music: 'blue', sfx: 'purple', video: 'ok' };
const fmtDate = (d) => new Date(d).toLocaleDateString('ko-KR');

export default function AdminPage() {
  const [role, setRole] = useState(undefined);
  const [panel, setPanel] = useState('dash');
  const [assets, setAssets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [members, setMembers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [cTab, setCTab] = useState('all');

  useEffect(() => {
    sb().auth.getUser().then(async ({ data }) => {
      if (!data?.user) { setRole(null); return; }
      const { data: p } = await sb().from('profiles').select('role').eq('id', data.user.id).single();
      setRole(p?.role || 'user');
    });
  }, []);

  useEffect(() => {
    if (role !== 'admin') return;
    const s = sb();
    s.from('assets').select('*').order('created_at', { ascending: false }).then(({ data }) => setAssets(data || []));
    s.from('purchases').select('*, assets(title,type), profiles(email)').order('created_at', { ascending: false }).then(({ data }) => setPurchases(data || []));
    s.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setMembers(data || []));
    s.from('inquiries').select('*').order('created_at', { ascending: false }).then(({ data }) => setInquiries(data || []));
  }, [role]);

  async function reloadAssets() {
    const { data } = await sb().from('assets').select('*').order('created_at', { ascending: false });
    setAssets(data || []);
  }
  async function toggleStatus(a) {
    await sb().from('assets').update({ status: a.status === 'active' ? 'hidden' : 'active' }).eq('id', a.id);
    reloadAssets();
  }
  async function setInquiryStatus(id, status) {
    await sb().from('inquiries').update({ status }).eq('id', id);
    setInquiries((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  if (role === undefined) return <div className="container"><div className="empty">확인 중…</div></div>;
  if (role !== 'admin') {
    return (
      <div className="container">
        <div className="empty">
          관리자 권한이 필요합니다.<br /><br />
          <span style={{ fontSize: 13 }}>
            Supabase SQL Editor에서 실행:<br />
            <code>update profiles set role = &apos;admin&apos; where email = &apos;내이메일&apos;;</code>
          </span>
        </div>
      </div>
    );
  }

  // ── derived stats ──
  const paid = purchases.filter((p) => p.status === 'paid');
  const totalSales = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const month = new Date().toISOString().slice(0, 7);
  const monthSales = paid.filter((p) => (p.created_at || '').startsWith(month)).reduce((s, p) => s + (p.amount || 0), 0);
  const downloads = assets.reduce((s, a) => s + (a.downloads || 0), 0);
  const byType = assets.reduce((m, a) => ((m[a.type] = (m[a.type] || 0) + 1), m), {});
  const popular = [...assets].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);
  const pendingInquiries = inquiries.filter((i) => i.status !== 'done');
  const pendingReview = assets.filter((a) => a.status === 'pending');

  const now = new Date();
  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${d.getMonth() + 1}월`, total: 0 });
  }
  const bi = Object.fromEntries(buckets.map((b, i) => [b.key, i]));
  paid.forEach((p) => { const k = (p.created_at || '').slice(0, 7); if (k in bi) buckets[bi[k]].total += p.amount || 0; });
  const maxBar = Math.max(...buckets.map((b) => b.total), 1);

  const filteredAssets = cTab === 'all' ? assets : assets.filter((a) => a.type === cTab);
  const CTABS = [{ key: 'all', label: '전체', n: assets.length }, ...Object.keys(TYPES).map((k) => ({ key: k, label: TYPES[k].label, n: byType[k] || 0 }))];

  return (
    <div className="container">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="sh">STOCKOREA<small>관리자 콘솔</small></div>
          {NAV.map((n) => (
            <button key={n.key} className={panel === n.key ? 'active' : ''} onClick={() => setPanel(n.key)}>
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
          <Link href="/admin/upload" className="side-link"><span>⬆️</span> 콘텐츠 업로드</Link>
          <Link href="/" className="side-link"><span>↩</span> 사이트로</Link>
        </aside>

        <div className="admin-main">
          {/* ===== 대시보드 ===== */}
          {panel === 'dash' && (
            <>
              <h1 className="admin-h1">대시보드</h1>
              <div className="stats">
                <div className="stat"><p>누적 매출</p><h3>{won(totalSales)}</h3><span className="delta">이번 달 {won(monthSales)}</span></div>
                <div className="stat"><p>누적 다운로드</p><h3>{downloads.toLocaleString('ko-KR')}건</h3></div>
                <div className="stat"><p>전체 회원</p><h3>{members.length}명</h3></div>
                <div className="stat"><p>등록 콘텐츠</p><h3>{assets.length}개</h3><span className="delta">음악 {byType.music || 0} · 효과음 {byType.sfx || 0} · 영상 {byType.video || 0}</span></div>
              </div>
              <div className="two-col">
                <div className="box">
                  <h2>월별 매출 추이 <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray)' }}>최근 7개월</span></h2>
                  <div className="bars">
                    {buckets.map((b) => (
                      <div className="bar-col" key={b.key}>
                        <div className="bar" style={{ height: `${(b.total / maxBar) * 100}%` }} title={won(b.total)} />
                        <span>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="box">
                  <h2>인기 콘텐츠 (다운로드순)</h2>
                  <table className="data">
                    <tbody>
                      {popular.length === 0 ? <tr><td>콘텐츠 없음</td></tr> : popular.map((a, i) => (
                        <tr key={a.id}>
                          <td style={{ width: 24 }}>{i + 1}</td>
                          <td>{a.title}</td>
                          <td><span className={`tag ${typeTag[a.type]}`}>{TYPES[a.type]?.label}</span></td>
                          <td style={{ textAlign: 'right' }}>{a.downloads || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="box">
                <h2>처리 대기 항목</h2>
                <table className="data">
                  <tbody>
                    <tr>
                      <td>기업문의</td><td>답변 대기 {pendingInquiries.length}건</td>
                      <td><span className="tag pending">대기</span></td>
                      <td style={{ textAlign: 'right' }}><button className="btn btn-sm" onClick={() => setPanel('biz')}>확인</button></td>
                    </tr>
                    <tr>
                      <td>콘텐츠 검수</td><td>검수 대기 {pendingReview.length}건</td>
                      <td><span className="tag pending">대기</span></td>
                      <td style={{ textAlign: 'right' }}><button className="btn btn-sm" onClick={() => setPanel('contents')}>확인</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== 콘텐츠 관리 ===== */}
          {panel === 'contents' && (
            <>
              <h1 className="admin-h1">콘텐츠 관리</h1>
              <div className="filter-row">
                {CTABS.map((t) => (
                  <button key={t.key} className={`chip${cTab === t.key ? ' active' : ''}`} onClick={() => setCTab(t.key)}>{t.label} <span style={{ opacity: .6 }}>{t.n}</span></button>
                ))}
                <Link href="/admin/upload" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>+ 새 콘텐츠</Link>
              </div>
              <div className="box" style={{ overflowX: 'auto' }}>
                <table className="data">
                  <thead><tr><th>제목</th><th>유형</th><th>카테고리</th><th>가격</th><th>다운로드</th><th>상태</th><th></th></tr></thead>
                  <tbody>
                    {filteredAssets.length === 0 ? <tr><td colSpan={7}>콘텐츠가 없습니다.</td></tr> : filteredAssets.map((a) => (
                      <tr key={a.id}>
                        <td><Link href={`/asset/${a.id}`} style={{ color: 'var(--primary)' }}>{a.title}</Link></td>
                        <td><span className={`tag ${typeTag[a.type]}`}>{TYPES[a.type]?.label}</span></td>
                        <td>{a.category}</td>
                        <td>{won(a.price)}</td>
                        <td>{a.downloads || 0}</td>
                        <td><span className={`status-tag ${a.status === 'active' ? 'ok' : a.status === 'pending' ? 'pending' : 'off'}`}>{a.status === 'active' ? '판매중' : a.status === 'pending' ? '검수 대기' : '숨김'}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <Link href={`/admin/contents/${a.id}/edit`} className="btn btn-sm" style={{ marginRight: 6 }}>수정</Link>
                          <button className="btn btn-sm" onClick={() => toggleStatus(a)}>{a.status === 'active' ? '숨기기' : '판매'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== 판매 관리 ===== */}
          {panel === 'sales' && (
            <>
              <h1 className="admin-h1">판매 관리</h1>
              <div className="stats">
                <div className="stat"><p>누적 매출</p><h3>{won(totalSales)}</h3></div>
                <div className="stat"><p>이번 달 매출</p><h3>{won(monthSales)}</h3></div>
                <div className="stat"><p>결제 완료</p><h3>{paid.length}건</h3></div>
                <div className="stat"><p>전체 주문</p><h3>{purchases.length}건</h3></div>
              </div>
              <div className="box" style={{ overflowX: 'auto' }}>
                <table className="data">
                  <thead><tr><th>일시</th><th>회원</th><th>콘텐츠</th><th>금액</th><th>상태</th></tr></thead>
                  <tbody>
                    {purchases.length === 0 ? <tr><td colSpan={5}>주문 내역이 없습니다.</td></tr> : purchases.map((p) => (
                      <tr key={p.id}>
                        <td>{fmtDate(p.created_at)}</td>
                        <td>{p.profiles?.email || '-'}</td>
                        <td>{p.assets?.title || '-'}</td>
                        <td>{won(p.amount)}</td>
                        <td><span className={`status-tag ${p.status === 'paid' ? 'ok' : p.status === 'pending' ? 'pending' : 'off'}`}>{p.status === 'paid' ? '완료' : p.status === 'pending' ? '대기' : p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== 회원 관리 ===== */}
          {panel === 'members' && (
            <>
              <h1 className="admin-h1">회원 관리</h1>
              <div className="box" style={{ overflowX: 'auto' }}>
                <table className="data">
                  <thead><tr><th>이메일</th><th>이름</th><th>등급</th><th>누적 구매</th><th>가입일</th></tr></thead>
                  <tbody>
                    {members.map((m) => {
                      const spent = paid.filter((p) => p.user_id === m.id).reduce((s, p) => s + (p.amount || 0), 0);
                      return (
                        <tr key={m.id}>
                          <td>{m.email}</td>
                          <td>{m.display_name || '-'}</td>
                          <td><span className={`tag ${m.role === 'admin' ? 'purple' : 'blue'}`}>{m.role === 'admin' ? '관리자' : '일반회원'}</span></td>
                          <td>{won(spent)}</td>
                          <td>{fmtDate(m.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== 기업문의 ===== */}
          {panel === 'biz' && (
            <>
              <h1 className="admin-h1">기업문의 접수</h1>
              <div className="box" style={{ overflowX: 'auto' }}>
                <table className="data">
                  <thead><tr><th>접수일</th><th>유형</th><th>회사</th><th>담당자</th><th>연락처</th><th>내용</th><th>상태</th><th></th></tr></thead>
                  <tbody>
                    {inquiries.length === 0 ? <tr><td colSpan={8}>접수된 문의가 없습니다.</td></tr> : inquiries.map((q) => (
                      <tr key={q.id}>
                        <td>{fmtDate(q.created_at)}</td>
                        <td>{q.type}</td>
                        <td>{q.company || '-'}</td>
                        <td>{q.contact_name || '-'}</td>
                        <td style={{ fontSize: 12 }}>{q.email}<br />{q.phone}</td>
                        <td style={{ maxWidth: 260, fontSize: 13 }}>{q.message}</td>
                        <td><span className={`status-tag ${q.status === 'done' ? 'ok' : q.status === 'in_progress' ? 'pending' : 'off'}`}>{q.status === 'done' ? '완료' : q.status === 'in_progress' ? '진행 중' : '답변 대기'}</span></td>
                        <td>
                          <select value={q.status} onChange={(e) => setInquiryStatus(q.id, e.target.value)} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)' }}>
                            <option value="pending">답변 대기</option>
                            <option value="in_progress">진행 중</option>
                            <option value="done">완료</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== SEO ===== */}
          {panel === 'seo' && (
            <>
              <h1 className="admin-h1">SEO 설정</h1>
              <div className="box">
                <h2>사이트 기본 SEO</h2>
                <div className="form-group"><label>사이트 제목 (국문)</label><input defaultValue="스톡코리아 STOCKOREA — 한국형 영상·사운드 스톡 플랫폼" /></div>
                <div className="form-group"><label>사이트 제목 (영문)</label><input defaultValue="STOCKOREA — Korean Video & Sound Stock Platform" /></div>
                <div className="form-group"><label>메타 설명 (국문)</label><textarea defaultValue="광고, 홍보, 유튜브, 숏폼 콘텐츠 제작을 위한 한국형 음악·효과음·영상 스톡 플랫폼." /></div>
                <div className="form-group"><label>대표 키워드</label><input defaultValue="한국 스톡영상, 국악 BGM, 전통시장 효과음, korean stock footage, korean ambience" /></div>
                <button className="btn btn-primary" onClick={() => alert('저장되었습니다. (설정 영구 저장 기능은 준비 중)')}>저장</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
