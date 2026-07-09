'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabaseBrowser';
import { useLang } from '@/lib/i18n';
import Logo from './Logo';

export default function Header() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useLang();
  const close = () => setOpen(false);

  useEffect(() => {
    const s = sb();
    s.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: sub } = s.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setRole(null); return; }
    sb().from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => setRole(data?.role || 'user'));
  }, [user]);

  async function logout() {
    await sb().auth.signOut();
    window.location.href = '/';
  }

  return (
    <header className="site">
      <div className="header-inner">
        <Link href="/" className="logo" onClick={close}><Logo /></Link>
        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="메뉴" aria-expanded={open}>
          {open ? '✕' : '☰'}
        </button>
        <div className={`nav-wrap${open ? ' open' : ''}`}>
          <nav className="main">
            <Link href="/browse/music" onClick={close}>{t('nav.music')}</Link>
            <Link href="/browse/sfx" onClick={close}>{t('nav.sfx')}</Link>
            <Link href="/browse/video" onClick={close}>{t('nav.video')}</Link>
            <Link href="/pricing" onClick={close}>{t('nav.pricing')}</Link>
            <Link href="/license" onClick={close}>{t('nav.license')}</Link>
            <Link href="/biz" onClick={close}>{t('nav.biz')}</Link>
          </nav>
          <div className="header-actions">
            <button
              className="lang-toggle"
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              aria-label="Toggle language"
              title={lang === 'ko' ? 'View in English' : '한국어로 보기'}
            >
              <span className={lang === 'ko' ? 'on' : ''}>KO</span>
              <span className="sep">/</span>
              <span className={lang === 'en' ? 'on' : ''}>EN</span>
            </button>
            {role === 'admin' && <Link href="/admin" className="btn btn-ghost" onClick={close}>{t('nav.admin')}</Link>}
            {user ? (
              <>
                <Link href="/mypage" className="btn btn-ghost" onClick={close}>{t('nav.mypage')}</Link>
                <button className="btn" onClick={() => { close(); logout(); }}>{t('nav.logout')}</button>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary" onClick={close}>{t('nav.login')}</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
