'use client';
import { useState } from 'react';
import { sb } from '@/lib/supabaseBrowser';
import { useLang } from '@/lib/i18n';

export default function BizPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ type: '', company: '', contact_name: '', email: '', phone: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const types = [t('biz.t1'), t('biz.t2'), t('biz.t3'), t('biz.t4'), t('biz.t5')];

  async function submit(e) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const { error } = await sb().from('inquiries').insert({
      type: form.type || types[0],
      company: form.company,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone,
      message: form.message,
    });
    setBusy(false);
    if (error) setErr(t('biz.fail'));
    else setDone(true);
  }

  return (
    <div className="container">
      <h2 className="page-title">{t('biz.title')}</h2>
      <p className="page-sub">{t('biz.sub')}</p>
      <div className="form-wrap wide">
        {done ? (
          <div className="ok-msg">{t('biz.success')}</div>
        ) : (
          <form onSubmit={submit}>
            {err && <div className="error-msg">{err}</div>}
            <div className="form-group">
              <label>{t('biz.type')}</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)}>
                {types.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>
            <div className="form-group"><label>{t('biz.company')}</label><input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder={t('biz.companyPh')} /></div>
            <div className="form-group"><label>{t('biz.contact')}</label><input value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} placeholder={t('biz.contactPh')} /></div>
            <div className="form-group"><label>{t('biz.email')}</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@company.com" required /></div>
            <div className="form-group"><label>{t('biz.phone')}</label><input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="010-0000-0000" /></div>
            <div className="form-group"><label>{t('biz.message')}</label><textarea value={form.message} onChange={(e) => set('message', e.target.value)} placeholder={t('biz.messagePh')} /></div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={busy}>
              {busy ? t('biz.sending') : t('biz.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
