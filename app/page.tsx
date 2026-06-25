"use client";
import { useState } from "react";
import DocumentCard from "./components/DocumentCard";

// One entry per document. Adding a new card is now just a new object here.
// `id` doubles as the FormData field name the API reads back.
const DOCUMENTS = [
  {
    id: "recruitment",
    title: "Présentation de Recrutement",
    description: "Téléchargez le modèle, remplissez-le, puis déposez votre version.",
    downloadUrl: "/form.pdf",
    downloadName: "presentation-de-recrutement.pdf",
  },
  {
    id: "procuration",
    title: "Procuration",
    description: "Téléchargez le modèle, remplissez-le, puis déposez votre version.",
    downloadUrl: "/PROCURATION.pdf",
    downloadName: "procuration.pdf",
  },
] as const;

type Status = "idle" | "sending" | "success" | "error";

export default function Home() {
  // Source of truth for every card's file, keyed by document id.
  // Angular analogy: like a single form-group model the children bind into.
  const [files, setFiles] = useState<Record<string, File>>({});
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const uploadedCount = Object.keys(files).length;
  const total = DOCUMENTS.length;

  const setFile = (id: string, file: File) => {
    setFiles((prev) => ({ ...prev, [id]: file }));
    setStatus("idle");
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStatus("idle");
  };

  const sendDocuments = async () => {
    const entries = Object.entries(files);
    if (entries.length === 0 || !name.trim()) return;

    setStatus("sending");
    const formData = new FormData();
    formData.append("name", name.trim());
    for (const [id, file] of entries) formData.append(id, file);

    try {
      const res = await fetch("/api/submit", { method: "POST", body: formData });
      if (res.ok) {
        // Clear the form so it's ready for the next person; keep `status` on
        // "success" so the confirmation message still shows.
        setFiles({});
        setName("");
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Submit failed:", err);
      setStatus("error");
    }
  };

  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-6 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M9 13h6M9 17h4" />
            </svg>
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Inscription CJE
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Documents d&apos;inscription
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Déposez vos documents d&apos;inscription
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Pour chaque document, téléchargez le modèle, remplissez-le, puis
            téléversez votre version. Vous pouvez en envoyer un ou plusieurs à la
            fois.
          </p>

          <div className="mt-6">
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
                setStatus("idle");
              }}
              placeholder="Prénom et nom"
              autoComplete="name"
              className="mt-2 w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:ring-slate-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {DOCUMENTS.map((doc) => (
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
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {uploadedCount} / {total} document(s) prêt(s)
            </span>
            {status === "success" && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Documents envoyés
              </span>
            )}
            {status === "error" && (
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Échec de l&apos;envoi. Réessayez.
              </span>
            )}
          </div>

          <button
            onClick={sendDocuments}
            disabled={uploadedCount === 0 || !name.trim() || status === "sending"}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-lg transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {status === "sending" ? (
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
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
