'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sb } from '@/lib/supabaseBrowser';
import { won, TYPES } from '@/lib/categories';

export default function AdminPage() {
  const [role, setRole] = useState(undefined); // undefined=로딩, null=비로그인
  const [assets, setAssets] = useState([]);
  const [sales, setSales] = useState(null);
  const [tab, setTab] = useState('all'); // all | music | sfx | video

  useEffect(() => {
    sb().auth.getUser().then(async ({ data }) => {
      if (!data?.user) { setRole(null); return; }
      const { data: p } = await sb().from('profiles').select('role').eq('id', data.user.id).single();
      setRole(p?.role || 'user');
    });
  }, []);

  useEffect(() => {
    if (role !== 'admin') return;
    load();
    sb().from('purchases').select('amount, status, created_at').eq('status', 'paid')
      .then(({ data }) => setSales(data || []));
  }, [role]);

  async function load() {
    const { data } = await sb().from('assets').select('*').order('created_at', { ascending: false });
    setAssets(data || []);
  }

  async function toggleStatus(a) {
    const next = a.status === 'active' ? 'hidden' : 'active';
    await sb().from('assets').update({ status: next }).eq('id', a.id);
    load();
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

  const total = (sales || []).reduce((s, x) => s + x.amount, 0);
  const month = new Date().toISOString().slice(0, 7);
  const monthly = (sales || []).filter((x) => x.created_at.startsWith(month)).reduce((s, x) => s + x.amount, 0);

  const TABS = [
    { key: 'all', label: '전체', count: assets.length },
    ...Object.keys(TYPES).map((k) => ({ key: k, label: TYPES[k].label, count: assets.filter((a) => a.type === k).length })),
  ];
  const filtered = tab === 'all' ? assets : assets.filter((a) => a.type === tab);

  return (
    <div className="container">
      <h2 className="page-title">관리자</h2>
      <p className="page-sub">콘텐츠 등록·관리와 판매 현황을 확인합니다.</p>

      <div className="plans" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', marginBottom: 28 }}>
        <div className="plan"><p className="desc">누적 매출</p><div className="price">{won(total)}</div></div>
        <div className="plan"><p className="desc">이번 달 매출</p><div className="price">{won(monthly)}</div></div>
        <div className="plan"><p className="desc">결제 건수</p><div className="price">{sales ? sales.length : '-'}건</div></div>
        <div className="plan"><p className="desc">등록 콘텐츠</p><div className="price">{assets.length}개</div></div>
      </div>

      <h3 className="section-title">
        콘텐츠 관리
        <Link href="/admin/upload" className="btn btn-primary">+ 새 콘텐츠 업로드</Link>
      </h3>

      <div className="chips" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`chip${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span style={{ opacity: 0.6 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          {assets.length === 0
            ? '등록된 콘텐츠가 없습니다. 첫 콘텐츠를 업로드해 보세요.'
            : `${tab === 'all' ? '' : TYPES[tab].label + ' '}콘텐츠가 없습니다.`}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data">
            <thead>
              <tr><th>제목</th><th>유형</th><th>카테고리</th><th>가격</th><th>다운로드</th><th>상태</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/asset/${a.id}`} style={{ color: 'var(--primary)' }}>{a.title}</Link></td>
                  <td>{TYPES[a.type]?.label}</td>
                  <td>{a.category}</td>
                  <td>{won(a.price)}</td>
                  <td>{a.downloads}</td>
                  <td>
                    <span className={`status-tag ${a.status === 'active' ? 'ok' : 'off'}`}>
                      {a.status === 'active' ? '판매중' : '숨김'}
                    </span>
                  </td>
                  <td>
                    <button className="btn" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => toggleStatus(a)}>
                      {a.status === 'active' ? '숨기기' : '판매 재개'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
