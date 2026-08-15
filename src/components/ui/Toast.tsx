interface ToastProps {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Toast({ title, message, actionLabel, actionHref }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-mint-950 px-4 py-3.5 text-white shadow-2xl">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-500">
          <CheckIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">{title}</p>
          <p className="truncate text-xs text-mint-300">{message}</p>
        </div>
        <a
          href={actionHref}
          target="_blank"
          rel="noopener"
          className="no-print shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-extrabold text-on-primary transition-colors hover:bg-primary-hover"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
}