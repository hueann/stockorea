'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sb } from '@/lib/supabaseBrowser';
import { useLang } from '@/lib/i18n';

function LoginForm() {
  const { t } = useLang();
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const next = useSearchParams().get('next') || '/';

  async function submit(e) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    const s = sb();
    if (mode === 'login') {
      const { error } = await s.auth.signInWithPassword({ email, password: pw });
      setBusy(false);
      if (error) setErr(t('login.errLogin'));
      else router.push(next);
    } else {
      const { data, error } = await s.auth.signUp({ email, password: pw });
      setBusy(false);
      if (error) setErr(error.message.includes('already') ? t('login.errExists') : t('login.errSignup') + error.message);
      else if (data.session) router.push(next);
      else setMsg(t('login.confirmSent'));
    }
  }

  return (
    <div className="container">
      <div className="form-wrap">
        <h2 className="page-title" style={{ textAlign: 'center' }}>
          {mode === 'login' ? t('login.loginTitle') : t('login.signupTitle')}
        </h2>
        <p className="page-sub" style={{ textAlign: 'center' }}>
          {mode === 'login' ? t('login.loginSub') : t('login.signupSub')}
        </p>
        {err && <div className="error-msg">{err}</div>}
        {msg && <div className="ok-msg">{msg}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>{t('login.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
          </div>
          <div className="form-group">
            <label>{t('login.password')}</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} placeholder={t('login.pwPlaceholder')} />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={busy}>
            {mode === 'login' ? t('login.loginBtn') : t('login.signupBtn')}
          </button>
        </form>
        <p className="form-note">
          {mode === 'login' ? (
            <>{t('login.noAccount')} <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); setMode('signup'); setErr(null); }}>{t('login.toSignup')}</a></>
          ) : (
            <>{t('login.hasAccount')} <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); setMode('login'); setErr(null); }}>{t('login.toLogin')}</a></>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="container"><div className="empty">불러오는 중…</div></div>}><LoginForm /></Suspense>;
}
