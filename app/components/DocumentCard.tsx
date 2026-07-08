'use client';

import { useRef, useState, useCallback } from 'react';

export interface DocumentCardProps {
  /** Heading shown at the top of the card. */
  title: string;
  /** Optional sub-line under the title. */
  description?: string;
  /** URL of the file the download button serves (e.g. "/form.pdf"). */
  downloadUrl: string;
  /** Filename suggested to the browser when downloading. */
  downloadName?: string;
  /** Accepted file types for the uploader (passed to the <input accept>). */
  accept?: string;
  /** The file currently held for this card (owned by the parent). */
  file?: File | null;
  /** Called whenever the user drops or picks a file. */
  onUpload?: (file: File) => void;
  /** Called when the user clears the uploaded file. */
  onRemove?: () => void;
}

/** Human-readable file size, e.g. "1.2 MB". */
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A reusable card with a download button and a drag-and-drop / click uploader.
 *
 * Angular analogy: a standalone, presentational component. The props are its
 * `@Input()`s; `onUpload` / `onRemove` are its `@Output()`s. It is "controlled":
 * the parent owns the `file` value and passes it back in, just like binding to
 * an `@Input()` rather than keeping local state.
 */
export default function DocumentCard({
  title,
  description,
  downloadUrl,
  downloadName,
  accept = 'application/pdf',
  file = null,
  onUpload,
  onRemove,
}: DocumentCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (selected: File | null | undefined) => {
      if (!selected) return;
      onUpload?.(selected);
    },
    [onUpload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  return (
    <section
      className={`flex w-full max-w-md flex-col rounded-2xl border bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 dark:bg-slate-900 dark:shadow-black/30 ${
        file
          ? 'border-emerald-300 ring-emerald-500/20 dark:border-emerald-700/60'
          : 'border-slate-200 ring-slate-900/5 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/15 to-orange-500/10 text-red-600 ring-1 ring-red-500/20 dark:text-red-400">
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
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {title}
            </h2>
            {file && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Prêt
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      </div>

      {/* Download */}
      <a
        href={downloadUrl}
        download={downloadName}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
        Télécharger le modèle
      </a>

      {/* Upload: either the dropzone (empty) or the uploaded-file row (filled) */}
      {file ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {file.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Retirer le fichier"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
            isDragging
              ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-800'
              : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-slate-400"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Cliquez pour téléverser
            </span>{' '}
            ou glissez-déposez votre PDF rempli
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          // Allow re-selecting the same file after a remove.
          e.target.value = '';
        }}
      />
    </section>
  );
}
