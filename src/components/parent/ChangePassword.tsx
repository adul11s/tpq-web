"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { parentApi } from "@/lib/api/parent";
import { localizedHref, pick, type Lang } from "@/lib/lang";
import { useParentSession } from "@/lib/parent/session";

const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi nanti.";
const SAME_AS_CURRENT = "Password baru harus berbeda";
const SUCCESS_NAV_DELAY_MS = 1200;

const changePasswordSchema = z
  .object({
    current_password: z
      .string({ message: "Kata sandi saat ini wajib diisi" })
      .min(1, "Kata sandi saat ini wajib diisi")
      .max(128, "Kata sandi saat ini maksimal 128 karakter"),
    new_password: z
      .string()
      .min(8, "Kata sandi baru minimal 8 karakter")
      .max(128, "Kata sandi baru maksimal 128 karakter"),
    confirm_new_password: z
      .string()
      .min(1, "Ulangi kata sandi wajib diisi"),
  })
  .refine(
    ({ new_password, confirm_new_password }) =>
      new_password === confirm_new_password,
    {
      message: "Ulangi kata sandi tidak cocok",
      path: ["confirm_new_password"],
    },
  );

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const inputClasses =
  "w-full rounded-xl border border-mint-200 bg-cream px-4 py-3 text-sm font-semibold text-mint-900 placeholder:text-mint-800/35 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30";
const labelClasses = "mb-1.5 block text-sm font-extrabold text-mint-900";
const errorClasses = "mt-1 text-xs font-semibold text-rose-600";

export function ChangePassword({ lang }: { lang: Lang }) {
  const { status, mustChangePassword, user, setSession } = useParentSession();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  useEffect(() => {
    if (status !== "authed") {
      if (status === "guest") {
        router.push(localizedHref(lang, "/parent/login"));
      }
      return;
    }
    if (success) {
      const timer = window.setTimeout(() => {
        router.push(localizedHref(lang, "/parent/anak"));
      }, SUCCESS_NAV_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
    if (!mustChangePassword) {
      router.push(localizedHref(lang, "/parent/anak"));
    }
  }, [status, mustChangePassword, lang, router, success]);

  async function onSubmit(values: ChangePasswordValues) {
    setServerError(null);
    setSuccess(false);
    try {
      await parentApi.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      setSuccess(true);
      setSession({
        email: user?.email ?? "",
        full_name: "",
        must_change_password: false,
      });
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;
      if (apiError?.status === 401) {
        setError("current_password", { message: apiError.message });
      } else if (
        apiError?.status === 422 &&
        apiError.message === SAME_AS_CURRENT
      ) {
        setError("new_password", { message: apiError.message });
      } else if (apiError?.status === 422) {
        setServerError(apiError.message);
      } else {
        setServerError(GENERIC_ERROR);
      }
    }
  }

  if (status !== "authed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div
          role="status"
          aria-label="Memuat"
          className="h-10 w-10 animate-spin rounded-full border-4 border-mint-200 border-t-mint-600"
        />
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-mint-100 bg-white p-6 shadow-xl shadow-mint-200/40 sm:p-8">
      <h1 className="font-display text-2xl font-bold text-mint-900">
        {pick(lang, "Ganti Kata Sandi", "Change Password")}
      </h1>
      <p className="mt-1 text-sm font-semibold text-mint-800/60">
        {lang === "en"
          ? "Set a new password for your account."
          : "Buat kata sandi baru untuk akun Anda."}
      </p>

      {success ? (
        <div
          role="status"
          className="mt-4 rounded-xl border border-mint-200 bg-mint-50 px-4 py-3 text-sm font-bold text-mint-800"
        >
          {pick(lang, "Kata sandi berhasil diubah", "Password changed successfully")}
        </div>
      ) : null}

      {serverError ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
        >
          {serverError}
        </div>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="current-password" className={labelClasses}>
            {pick(lang, "Kata Sandi Saat Ini", "Current Password")}
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClasses}
            {...register("current_password")}
          />
          {errors.current_password ? (
            <p className={errorClasses} role="alert">
              {errors.current_password.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="new-password" className={labelClasses}>
            {pick(lang, "Kata Sandi Baru", "New Password")}
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClasses}
            {...register("new_password")}
          />
          {errors.new_password ? (
            <p className={errorClasses} role="alert">
              {errors.new_password.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="confirm-password" className={labelClasses}>
            {pick(lang, "Ulangi Kata Sandi Baru", "Confirm New Password")}
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClasses}
            {...register("confirm_new_password")}
          />
          {errors.confirm_new_password ? (
            <p className={errorClasses} role="alert">
              {errors.confirm_new_password.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || success}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-mint-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting || success ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          ) : null}
          {pick(lang, "Simpan", "Save")}
        </button>
      </form>
    </div>
  );
}