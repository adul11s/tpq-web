"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { adminApi } from "@/lib/api/auth";
import type { EnrollResponse } from "@/lib/api/auth";
import type { ApiError } from "@/lib/api/client";
import { qrDataUrl } from "@/lib/admin/qr";

export const dynamic = "force-dynamic";

const totpSchema = z.string().regex(/^\d{6}$/, "Kode TOTP harus 6 digit angka");
const emailSchema = z.email("Email tidak valid");

type Step = "email" | "qr" | "codes" | "totp";

const inputClasses =
  "w-full rounded-xl border border-mint-200 bg-cream px-4 py-3 text-sm font-semibold text-mint-900 placeholder:text-mint-800/35 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30";
const labelClasses = "mb-1.5 block text-sm font-extrabold text-mint-900";

function EnrollForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [step, setStep] = useState<Step>(emailParam ? "qr" : "email");
  const [email, setEmail] = useState(emailParam ?? "");
  const [enroll, setEnroll] = useState<EnrollResponse | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<{
    status: number;
    message: string;
  } | null>(null);
  const [totp, setTotp] = useState("");
  const [codesSaved, setCodesSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrError, setQrError] = useState(false);
  const startedRef = useRef(false);

  async function generateQr(uri: string) {
    setQrError(false);
    try {
      setQrSrc(await qrDataUrl(uri));
    } catch {
      setQrSrc(null);
      setQrError(true);
    }
  }

  async function startEnroll(targetEmail: string) {
    setLoading(true);
    setFieldError(null);
    setServerError(null);
    setQrError(false);
    try {
      const data = await adminApi.enroll(targetEmail);
      setEnroll(data);
      setStep("qr");
      await generateQr(data.otpauth_uri);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError({ status: apiError.status, message: apiError.message });
      setEnroll(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (emailParam && !startedRef.current) {
      startedRef.current = true;
      void startEnroll(emailParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }
    void startEnroll(parsed.data);
  }

  function downloadCodes() {
    if (!enroll) return;
    const blob = new Blob([enroll.backup_codes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tpq-2fa-backup-codes.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function copyCodes() {
    if (!enroll) return;
    try {
      await navigator.clipboard.writeText(enroll.backup_codes.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function handleTotpSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!enroll) return;
    setFieldError(null);
    setServerError(null);
    const parsed = totpSchema.safeParse(totp);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.enrollConfirm(email, enroll.secret, parsed.data, enroll.backup_codes);
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
          {fieldError ? (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
            >
              {fieldError}
            </p>
          ) : null}

          {serverError ? (
            <div
              role="alert"
              className={
                rateLimited
                  ? "mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700"
                  : "mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
              }
            >
              {serverError.message}
            </div>
          ) : null}

          {step === "email" ? (
            <>
              <h2 className="text-xl font-extrabold text-mint-900">Email</h2>
              <p className="mt-1 text-sm font-semibold text-mint-800/60">
                Masukkan email akun yang Anda gunakan.
              </p>
              <form className="mt-5 space-y-4" noValidate onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="enroll-email" className={labelClasses}>
                    Email
                  </label>
                  <input
                    id="enroll-email"
                    type="email"
                    autoComplete="email"
                    placeholder="contoh: ustadz.ahmad@tpq.id"
                    className={inputClasses}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    />
                  ) : null}
                  Mulai
                </button>
              </form>
            </>
          ) : null}

          {step === "qr" ? (
            <>
              <h2 className="text-xl font-extrabold text-mint-900">Amankan Akun Anda</h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-mint-800/60">
                Keamanan akun memerlukan verifikasi dua langkah (2FA). Pindai kode QR di
                bawah dengan aplikasi autentikator (Google Authenticator, Aegis, dll).
              </p>

              <div className="mx-auto mt-5 flex aspect-square w-44 items-center justify-center rounded-2xl border-2 border-dashed border-mint-300 bg-white p-3">
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt="Pindai kode QR dengan aplikasi autentikator"
                    width={220}
                    height={220}
                    className="h-full w-full"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 animate-spin rounded-full border-2 border-mint-300 border-t-mint-600"
                  />
                )}
              </div>

              {qrError ? (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                >
                  Gagal membuat QR {"\u2014"} coba lagi
                </div>
              ) : null}

              {qrError && enroll ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void generateQr(enroll.otpauth_uri)}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Coba lagi
                </button>
              ) : null}

              {loading ? null : (
                <button
                  type="button"
                  disabled={!qrSrc}
                  onClick={() => setStep("codes")}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Saya sudah memindai
                </button>
              )}
            </>
          ) : null}

          {step === "codes" && enroll ? (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
                <p className="text-xs font-bold leading-relaxed text-amber-700">
                  Kode cadangan{" "}
                  <span className="underline">hanya ditampilkan sekali</span>. Simpan di
                  tempat aman — setiap kode hanya bisa dipakai satu kali.
                </p>
              </div>

              <h2 className="mt-5 text-xl font-extrabold text-mint-900">
                Kode Cadangan Anda
              </h2>
              <ol className="mt-4 grid grid-cols-2 gap-2">
                {enroll.backup_codes.map((code) => (
                  <li
                    key={code}
                    className="rounded-xl bg-mint-50 px-3 py-2 text-center font-mono text-sm font-bold text-mint-800"
                  >
                    {code}
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => void copyCodes()}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-mint-300 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
                >
                  {copied ? "Tersalin!" : "Salin semua"}
                </button>
                <button
                  type="button"
                  onClick={downloadCodes}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-mint-300 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3v10m0 0-4-4m4 4 4-4" />
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                  Unduh .txt
                </button>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-mint-50 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={codesSaved}
                  onChange={(event) => setCodesSaved(event.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-mint-300 accent-mint-600"
                />
                <span className="text-xs font-bold leading-relaxed text-mint-800">
                  Saya sudah menyimpan kode cadangan di tempat aman.
                </span>
              </label>

              <button
                type="button"
                disabled={!codesSaved}
                onClick={() => setStep("totp")}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Lanjut
              </button>
            </>
          ) : null}

          {step === "totp" && enroll ? (
            <>
              <h2 className="text-xl font-extrabold text-mint-900">
                Verifikasi Kode Pertama
              </h2>
              <p className="mt-1 text-sm font-semibold text-mint-800/60">
                Masukkan kode 6 digit dari aplikasi autentikator untuk mengaktifkan 2FA.
              </p>

              <form className="mt-5 space-y-4" noValidate onSubmit={handleTotpSubmit}>
                <div>
                  <label htmlFor="enroll-totp" className={labelClasses}>
                    Kode TOTP
                  </label>
                  <input
                    id="enroll-totp"
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
                  Verifikasi &amp; Aktifkan
                </button>
              </form>

              {serverError ? (
                <button
                  type="button"
                  onClick={() => setStep("codes")}
                  className="mt-2 block w-full text-center text-xs font-extrabold text-mint-600 underline underline-offset-2 hover:text-mint-700"
                >
                  &larr; Kembali ke kode cadangan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("codes")}
                  className="mt-2 block w-full text-center text-xs font-extrabold text-mint-600 underline underline-offset-2 hover:text-mint-700"
                >
                  &larr; Kembali
                </button>
              )}
            </>
          ) : null}

          {serverError && !enroll ? (
            <button
              type="button"
              onClick={() => void startEnroll(email)}
              disabled={loading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              ) : null}
              Coba lagi
            </button>
          ) : null}

          <Link
            href="/admin/login"
            className="mt-4 block w-full text-center text-xs font-bold text-mint-800/50 hover:text-mint-700"
          >
            &larr; Kembali ke login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminEnrollPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <EnrollForm />
    </Suspense>
  );
}
