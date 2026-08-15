interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  retryLabel: string;
}

export function ErrorState({ message, onRetry, retryLabel }: ErrorStateProps) {
  return (
    <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-bold text-rose-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-on-primary transition-colors hover:bg-primary-hover"
      >
        {retryLabel}
      </button>
    </div>
  );
}