"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { parentApi } from "@/lib/api/parent";
import { localizedHref, pick, type Lang } from "@/lib/lang";
import { useParentSession } from "@/lib/parent/session";

const RATE_LIMIT_COPY = "Terlalu banyak percobaan — coba lagi nanti";
const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi nanti.";

const inputClasses =
  "w-full rounded-xl border border-mint-200 bg-cream px-4 py-3 text-sm font-semibold text-mint-900 placeholder:text-mint-800/35 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30";
const labelClasses = "mb-1.5 block text-sm font-extrabold text-mint-900";

export function ParentLogin({ lang }: { lang: Lang }) {
  const { status, mustChangePassword, setSession } = useParentSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ status: number; message: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authed") return;
    router.push(
      localizedHref(
        lang,
        mustChangePassword ? "/parent/ganti-password" : "/parent/anak",
      ),
    );
  }, [status, mustChangePassword, lang, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await parentApi.login({ email: email.trim(), password });
      setSession({
        email: email.trim(),
        full_name: "",
        must_change_password: result.must_change_password,
      });
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;
      if (apiError?.status === 401) {
        setError({ status: 401, message: apiError.message });
      } else if (apiError?.status === 429) {
        setError({ status: 429, message: RATE_LIMIT_COPY });
      } else {
        setError({ status: apiError?.status ?? 0, message: GENERIC_ERROR });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || status === "authed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div
          role="status"
          aria-label={pick(lang, "Memuat", "Loading")}
          className="h-10 w-10 animate-spin rounded-full border-4 border-mint-200 border-t-mint-600"
        />
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-mint-100 bg-white p-6 shadow-xl shadow-mint-200/40 sm:p-8">
      <h1 className="font-display text-2xl font-bold text-mint-900">
        {pick(lang, "Masuk Orang Tua", "Parent Login")}
      </h1>
      <p className="mt-1 text-sm font-semibold text-mint-800/60">
        {lang === "en"
          ? "Use the email & password provided by the school."
          : "Gunakan email & kata sandi dari pihak sekolah."}
      </p>

      {error ? (
        <div
          role="alert"
          className={
            error.status === 429
              ? "mt-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm font-bold text-gold-700"
              : "mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
          }
        >
          {error.message}
        </div>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="parent-login-email" className={labelClasses}>
            Email
          </label>
          <input
            id="parent-login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="parent-login-password" className={labelClasses}>
            {lang === "en" ? "Password" : "Kata sandi"}
          </label>
          <input
            id="parent-login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          ) : null}
          {lang === "en" ? "Log In" : "Masuk"}
        </button>
      </form>
    </div>
  );
}