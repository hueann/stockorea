'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLang, FAQ_DATA } from '@/lib/i18n';

export default function SupportPage() {
  const { t, lang } = useLang();
  const faqs = FAQ_DATA[lang] || FAQ_DATA.ko;
  const cats = [t('common.all'), ...Array.from(new Set(faqs.map((f) => f.cat)))];
  const [cat, setCat] = useState(cats[0]);
  const [open, setOpen] = useState(null);

  const shown = cat === cats[0] ? faqs : faqs.filter((f) => f.cat === cat);

  return (
    <div className="container">
      <h2 className="page-title">{t('support.title')}</h2>
      <p className="page-sub">{t('support.sub')}</p>
      <div className="chips">
        {cats.map((c) => (
          <button key={c} className={`chip${cat === c ? ' active' : ''}`} onClick={() => { setCat(c); setOpen(null); }}>{c}</button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        {shown.map((f, i) => {
          const key = `${f.cat}-${i}`;
          const isOpen = open === key;
          return (
            <div key={key} className={`faq-item${isOpen ? ' open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(isOpen ? null : key)}>
                <span>[{f.cat}] {f.q}</span><span className="faq-arrow">▾</span>
              </button>
              {isOpen && <div className="faq-a">{f.a}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <Link href="/biz" className="btn btn-primary btn-lg">{t('support.contactBtn')}</Link>
      </div>
    </div>
  );
}
