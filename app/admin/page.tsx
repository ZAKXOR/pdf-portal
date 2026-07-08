'use client';
import { useEffect, useState } from 'react';
import SiteHeader from '../components/SiteHeader';

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

export default function AdminPage() {
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/recipient')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json: { recipient: string | null }) => {
        if (cancelled) return;
        setRecipient(json.recipient ?? '');
        setStatus('idle');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch('/api/recipient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: recipient.trim() }),
      });
      setStatus(res.ok ? 'saved' : 'error');
    } catch (err) {
      console.error('Save failed:', err);
      setStatus('error');
    }
  };

  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-96 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/10" />
        <div className="absolute -top-16 right-1/5 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />
      </div>

      <SiteHeader subtitle="Administration" nav="portal" />

      <div className="relative mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Destinataire des documents
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Les documents soumis depuis le portail seront envoyés à cette adresse e-mail.
          </p>

          <div className="mt-6">
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Recipient
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                id="recipient"
                type="email"
                value={recipient}
                disabled={status === 'loading'}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setStatus('idle');
                }}
                placeholder="destinataire@exemple.com"
                autoComplete="email"
                className="w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-slate-700"
              />
              <button
                onClick={save}
                disabled={!recipient.trim() || status === 'saving' || status === 'loading'}
                className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {status === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>

            <div className="mt-3 h-5">
              {status === 'saved' && (
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Destinataire enregistré
                </span>
              )}
              {status === 'error' && (
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Échec de l&apos;enregistrement. Vérifiez l&apos;adresse et réessayez.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
