"use client";

export function ForbiddenNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
    >
      <p className="text-sm font-bold text-rose-700">
        Forbidden &mdash; muat ulang halaman
      </p>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
        >
          Muat Ulang
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
