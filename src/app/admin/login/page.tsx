"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { adminApi } from "@/lib/api/auth";
import { useQueryParams } from "@/lib/admin/useQueryParams";
import type { ApiError } from "@/lib/api/client";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z
    .string()
    .min(1, "Kata sandi wajib diisi")
    .max(128, "Kata sandi maksimal 128 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

const inputClasses =
  "w-full rounded-xl border border-mint-200 bg-cream px-4 py-3 text-sm font-semibold text-mint-900 placeholder:text-mint-800/35 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30";
const labelClasses = "mb-1.5 block text-sm font-extrabold text-mint-900";

function LoginForm() {
  const router = useRouter();
  const searchParams = useQueryParams();
  const [serverError, setServerError] = useState<{
    status: number;
    message: string;
  } | null>(null);
  const expired = searchParams.get("reason") === "expired";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      const { challenge } = await adminApi.login(values.email, values.password);
      const email = encodeURIComponent(values.email);
      const base =
        challenge === "totp"
          ? `/admin/login/verify?email=${email}`
          : `/admin/login/enroll?email=${email}`;
      router.push(base);
    } catch (error) {
      const apiError = error as ApiError;
      setServerError({ status: apiError.status, message: apiError.message });
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
          <h2 className="text-xl font-extrabold text-mint-900">Masuk</h2>
          <p className="mt-1 text-sm font-semibold text-mint-800/60">
            Gunakan akun yang diberikan pengelola TPQ.
          </p>

          {expired ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700"
            >
              Sesi berakhir, silakan masuk kembali
            </div>
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

          <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="login-email" className={labelClasses}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="contoh: ustadz.ahmad@tpq.id"
                className={inputClasses}
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-1.5 text-xs font-bold text-rose-600" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="login-password" className={labelClasses}>
                Kata sandi
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputClasses}
                {...register("password")}
              />
              {errors.password ? (
                <p className="mt-1.5 text-xs font-bold text-rose-600" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
              ) : null}
              Masuk
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs font-bold text-mint-800/50">
          <Link
            href="/"
            className="text-mint-600 underline underline-offset-2 hover:text-mint-700"
          >
            Kembali ke situs
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <LoginForm />;
}
