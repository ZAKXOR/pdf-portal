import Link from 'next/link';

export interface SiteHeaderProps {
  /** Small line shown under the site title. */
  subtitle: string;
  /** Which nav action to show on the right. */
  nav: 'admin' | 'portal';
}

/** Sticky glassy header shared by the portal and the admin page. */
export default function SiteHeader({ subtitle, nav }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-6 py-4">
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
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Inscription CJE
          </h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        {nav === 'admin' ? (
          <Link
            href="/admin"
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          >
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
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
            Admin
          </Link>
        ) : (
          <Link
            href="/"
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          >
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
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Retour au portail
          </Link>
        )}
      </div>
    </header>
  );
}
