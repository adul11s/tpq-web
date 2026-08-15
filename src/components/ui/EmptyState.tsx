interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  hint: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, hint, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-mint-300 bg-white px-6 py-16 text-center">
      {icon ? (
        <div className="mx-auto flex h-14 w-14 items-center justify-center text-mint-300">
          {icon}
        </div>
      ) : null}
      <p className="mt-4 font-display text-lg font-bold text-mint-900">{title}</p>
      <p className="mt-1 text-sm font-semibold text-mint-800/60">{hint}</p>
      {ctaLabel && onCta ? (
        <button
          type="button"
          onClick={onCta}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-on-primary transition-colors hover:bg-primary-hover"
        >
          {ctaLabel}
        </button>
      ) : null}
    </div>
  );
}