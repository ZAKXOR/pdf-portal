'use client';
import { useEffect, useState } from 'react';
import DocumentCard from './components/DocumentCard';
import SiteHeader from './components/SiteHeader';

type Document = {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  downloadName: string;
};

// One entry per document. Adding a new card is now just a new object here.
// `id` doubles as the FormData field name the API reads back.
/*
const DOCUMENTS = [
  {
    id: 'recruitment',
    title: 'Présentation de Recrutement',
    description: 'Téléchargez le modèle, remplissez-le, puis déposez votre version.',
    downloadUrl: '/form.pdf',
    downloadName: 'presentation-de-recrutement.pdf',
  },
  {
    id: 'procuration',
    title: 'Procuration',
    description: 'Téléchargez le modèle, remplissez-le, puis déposez votre version.',
    downloadUrl: '/PROCURATION.pdf',
    downloadName: 'procuration.pdf',
  },
] as const;
*/
type Status = 'idle' | 'sending' | 'success' | 'error';

export default function Home() {
  // Source of truth for every card's file, keyed by document id.
  // Angular analogy: like a single form-group model the children bind into.
  const [files, setFiles] = useState<Record<string, File>>({});
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [documents, setDocuments] = useState<Document[]>([]);

  const uploadedCount = Object.keys(files).length;
  const total = documents.length;

  const setFile = (id: string, file: File) => {
    setFiles((prev) => ({ ...prev, [id]: file }));
    setStatus('idle');
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStatus('idle');
  };

  // Build the card list from whatever PDFs the server has in /public.
  useEffect(() => {
    fetch('/api/forms')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
      .then((json: { files: string[] }) => {
        const docs = json.files.map((s) => {
          const name = s.split('.')[0];
          return {
            id: name,
            title: name,
            description: 'Téléchargez le modèle, remplissez-le, puis déposez votre version.',
            downloadUrl: '/' + s,
            downloadName: s,
          } as Document;
        });
        setDocuments(docs);
      })
      .catch((err) => console.error('Loading forms failed:', err));
  }, []);

  const sendDocuments = async () => {
    const entries = Object.entries(files);
    if (entries.length === 0 || !name.trim()) return;

    setStatus('sending');
    const formData = new FormData();
    formData.append('name', name.trim());
    for (const [id, file] of entries) formData.append(id, file);

    try {
      const res = await fetch('/api/submit', { method: 'POST', body: formData });
      if (res.ok) {
        // Clear the form so it's ready for the next person; keep `status` on
        // "success" so the confirmation message still shows.
        setFiles({});
        setName('');
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Submit failed:', err);
      setStatus('error');
    }
  };

  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Decorative background glows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-96 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/10" />
        <div className="absolute -top-16 right-1/5 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/10" />
      </div>

      <SiteHeader subtitle="Documents d'inscription" nav="admin" />

      <div className="relative mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Portail de dépôt
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Déposez vos documents d&apos;inscription
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Pour chaque document, téléchargez le modèle, remplissez-le, puis téléversez votre
            version. Vous pouvez en envoyer un ou plusieurs à la fois.
          </p>

          <div className="mt-8">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setStatus('idle');
              }}
              placeholder="Prénom et nom"
              autoComplete="name"
              className="mt-2 w-full max-w-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-slate-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              description={doc.description}
              downloadUrl={doc.downloadUrl}
              downloadName={doc.downloadName}
              file={files[doc.id] ?? null}
              onUpload={(file) => setFile(doc.id, file)}
              onRemove={() => removeFile(doc.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky action bar: progress on the left, submit + status on the right. */}
      <div className="sticky bottom-0 z-20 border-t border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-slate-200 sm:block dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: total > 0 ? `${(uploadedCount / total) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {uploadedCount} / {total} document(s) prêt(s)
            </span>
            {status === 'success' && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Documents envoyés
              </span>
            )}
            {status === 'error' && (
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Échec de l&apos;envoi. Réessayez.
              </span>
            )}
          </div>

          <button
            onClick={sendDocuments}
            disabled={uploadedCount === 0 || !name.trim() || status === 'sending'}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {status === 'sending' ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Envoi…
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
