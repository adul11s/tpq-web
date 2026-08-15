"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryParams } from "@/lib/admin/useQueryParams";
import { z } from "zod";
import { adminApi } from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/client";

export const dynamic = "force-dynamic";

const totpSchema = z.string().regex(/^\d{6}$/, "Kode TOTP harus 6 digit angka");
const backupSchema = z
  .string()
  .regex(/^[0-9A-F]{4}-[0-9A-F]{4}$/, "Format kode cadangan tidak valid (contoh: ABCD-EF12)");
const emailSchema = z.email("Email tidak valid");

type VerifyMode = "totp" | "backup";

const inputClasses =
  "w-full rounded-xl border border-mint-200 bg-cream px-4 py-3 text-sm font-semibold text-mint-900 placeholder:text-mint-800/35 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30";
const labelClasses = "mb-1.5 block text-sm font-extrabold text-mint-900";

function VerifyForm() {
  const router = useRouter();
    const emailParam = useQueryParams().get("email");

  const [mode, setMode] = useState<VerifyMode>("totp");
  const [email, setEmail] = useState(emailParam ?? "");
  const [totp, setTotp] = useState("");
  const [backup, setBackup] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<{
    status: number;
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsEmail = !emailParam;

  function handleBackupChange(value: string) {
    let v = value.toUpperCase().slice(0, 9);
    if (v.length > 4 && v[4] !== "-") v = `${v.slice(0, 4)}-${v.slice(4)}`;
    setBackup(v);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (fieldError) setFieldError(null);
    setServerError(null);

    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) {
      setFieldError(emailParsed.error.issues[0].message);
      return;
    }

    const token = mode === "totp" ? totp : backup;
    const parsed = (mode === "totp" ? totpSchema : backupSchema).safeParse(token);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.verify(email, token);
      router.push("/admin");
    } catch (error) {
      const apiError = error as ApiError;
      setServerError({ status: apiError.status, message: apiError.message });
    } finally {
      setSubmitting(false);
    }
  }

  const rateLimited = serverError?.status === 429;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mint-50 via-cream to-amber-50 p-4">
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-600 text-white shadow-lg shadow-mint-600/25">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              <path d="M11 7.5 11.9 9.9 14.3 10.8 11.9 11.7 11 14.1 10.1 11.7 7.7 10.8 10.1 9.9Z" />
            </svg>
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-mint-900">
            TPQ Qur&rsquo;ani
          </h1>
          <p className="text-xs font-extrabold uppercase tracking-widest text-mint-600">
            Panel Admin
          </p>
        </div>

        <div className="rounded-3xl border border-mint-100 bg-white p-7 shadow-xl shadow-mint-200/40 sm:p-8">
          <h2 className="text-xl font-extrabold text-mint-900">
            {mode === "totp" ? "Kode Verifikasi" : "Kode Cadangan"}
          </h2>
          <p className="mt-1 text-sm font-semibold text-mint-800/60">
            {mode === "totp"
              ? "Masukkan 6 digit kode dari aplikasi autentikator Anda."
              : "Masukkan salah satu kode cadangan yang disimpan saat 2FA diaktifkan."}
          </p>

          {fieldError ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
            >
              {fieldError}
            </p>
          ) : null}

          {serverError ? (
            <div
              role="alert"
              className={
                rateLimited
                  ? "mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700"
                  : "mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
              }
            >
              {serverError.message}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" noValidate onSubmit={onSubmit}>
            {needsEmail ? (
              <div>
                <label htmlFor="verify-email" className={labelClasses}>
                  Email
                </label>
                <input
                  id="verify-email"
                  type="email"
                  autoComplete="email"
                  placeholder="contoh: ustadz.ahmad@tpq.id"
                  className={inputClasses}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            ) : null}

            {mode === "totp" ? (
              <div>
                <label htmlFor="totp-code" className={labelClasses}>
                  Kode TOTP
                </label>
                <input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  className="w-full rounded-xl border border-mint-200 bg-cream px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-mint-900 placeholder:text-mint-800/25 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30"
                  value={totp}
                  onChange={(event) =>
                    setTotp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </div>
            ) : (
              <div>
                <label htmlFor="backup-code" className={labelClasses}>
                  Kode cadangan
                </label>
                <input
                  id="backup-code"
                  type="text"
                  autoComplete="one-time-code"
                  placeholder="ABCD-EF12"
                  className="w-full rounded-xl border border-mint-200 bg-cream px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-mint-900 placeholder:text-mint-800/25 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30"
                  value={backup}
                  onChange={(event) => handleBackupChange(event.target.value)}
                />
              </div>
            )}

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
              Verifikasi
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "totp" ? "backup" : "totp");
              setFieldError(null);
              setServerError(null);
            }}
            className="mt-3 w-full text-center text-xs font-extrabold text-mint-600 underline underline-offset-2 hover:text-mint-700"
          >
            {mode === "totp" ? "Pakai kode cadangan" : "Pakai kode TOTP"}
          </button>

          <Link
            href="/admin/login"
            className="mt-2 block w-full text-center text-xs font-bold text-mint-800/50 hover:text-mint-700"
          >
            &larr; Kembali ke login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
      <VerifyForm />
  );
}
