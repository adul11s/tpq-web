"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parentApi } from "@/lib/api/parent";
import { localizedHref, pick, type Lang } from "@/lib/lang";
import { useParentSession } from "@/lib/parent/session";

export function ParentNav({ lang }: { lang: Lang }) {
  const { status, mustChangePassword, setSession } = useParentSession();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "authed" || mustChangePassword) {
    return null;
  }

  async function onLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError(null);
    try {
      await parentApi.logout();
      setSession(null);
      router.push(localizedHref(lang, "/parent/login"));
    } catch {
      setError(
        pick(
          lang,
          "Gagal keluar. Coba lagi nanti.",
          "Logout failed. Try again later.",
        ),
      );
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-mint-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href={localizedHref(lang, "/parent/anak")}
          className="inline-flex min-h-11 items-center rounded-full bg-mint-50 px-4 text-sm font-extrabold text-mint-800 transition-colors hover:bg-mint-100"
        >
          {pick(lang, "Anak Saya", "My Children")}
        </Link>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-mint-200 bg-white px-4 text-sm font-extrabold text-mint-800 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingOut ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          ) : null}
          {pick(lang, "Keluar", "Log Out")}
        </button>
      </div>
      {error ? (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-center text-xs font-bold text-rose-700">
          <p role="alert">{error}</p>
        </div>
      ) : null}
    </header>
  );
}
