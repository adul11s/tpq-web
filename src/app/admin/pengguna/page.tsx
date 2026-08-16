"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  userApi,
  type ProvisionedParent,
} from "@/lib/api/users";
import { useSession } from "@/lib/admin/session";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  admin: "Administrator",
  content_manager: "Pengelola Konten",
  parent: "Orang Tua",
};

const parentFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Email tidak valid"),
  full_name: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(150, "Nama lengkap maksimal 150 karakter"),
});

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

function generateInitialPassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
  let password = "";
  for (let i = 0; i < 12; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

function whatsappHandoff(created: ProvisionedParent): string {
  const text =
    `Assalamualaikum.\nAkun orang tua TPQ Qur'ani telah dibuat.\n\n` +
    `Email: ${created.email}\nKata sandi awal: ${created.initial_password}\n` +
    `\nSegera ganti kata sandi saat pertama kali masuk.\nTerima kasih.`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

type ActionKind = "reset2fa" | "deactivate" | "activate";

interface PendingAction {
  kind: ActionKind;
  user: AdminUser;
}

const SUCCESS_COPY: Record<ActionKind, string> = {
  reset2fa: "2FA direset, pengguna harus daftar ulang",
  deactivate: "Pengguna berhasil dinonaktifkan",
  activate: "Pengguna berhasil diaktifkan kembali",
};

function actionCopy(action: PendingAction): { title: string; body: string } {
  switch (action.kind) {
    case "reset2fa":
      return {
        title: "Reset 2FA",
        body: `Reset 2FA untuk ${action.user.full_name} (${action.user.email})? Pengguna harus daftar ulang aplikasi autentikasi.`,
      };
    case "deactivate":
      return {
        title: "Nonaktifkan pengguna",
        body: `Nonaktifkan ${action.user.full_name}? Sesi pengguna akan diakhiri.`,
      };
    case "activate":
      return {
        title: "Aktifkan kembali",
        body: `Aktifkan kembali ${action.user.full_name}?`,
      };
  }
}

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

export default function PenggunaPage() {
  const { user } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [pendingReset, setPendingReset] = useState<AdminUser | null>(null);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    userApi
      .list()
      .then((result) => setUsers(result.users))
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  async function handleConfirm() {
    if (!pending) return;
    setActing(true);
    setError(null);
    try {
      if (pending.kind === "reset2fa") {
        await userApi.reset2fa(pending.user.id);
      } else if (pending.kind === "deactivate") {
        await userApi.deactivate(pending.user.id);
      } else {
        await userApi.activate(pending.user.id);
      }
      setSuccess(SUCCESS_COPY[pending.kind]);
      setPending(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
      setPending(null);
    } finally {
      setActing(false);
    }
  }

  async function handleResetPassword(newPassword: string) {
    if (!pendingReset) return;
    setActing(true);
    setError(null);
    try {
      await userApi.resetParentPassword(pendingReset.id, newPassword);
      setSuccess("Password direset, sesi lama diakhiri");
      setPendingReset(null);
    } catch (err) {
      setError(errorMessage(err));
      setPendingReset(null);
    } finally {
      setActing(false);
    }
  }

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <p
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        Halaman ini khusus untuk admin.
      </p>
    );
  }

  const copy = pending ? actionCopy(pending) : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-mint-900">Pengguna</h2>
        <Button size="sm" onClick={() => setProvisionOpen(true)}>
          Tambah Orang Tua
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat…</p>
      ) : users.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Tidak ada pengguna.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">Email</th>
                <th className="px-3 py-2.5 font-semibold">Nama Lengkap</th>
                <th className="px-3 py-2.5 font-semibold">Peran</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">2FA</th>
                <th className="px-3 py-2.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => {
                const isSelf = user.id === row.id;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-2.5 font-semibold text-mint-900">
                      {row.email}
                    </td>
                    <td className="px-3 py-2.5">{row.full_name}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={row.role === "admin" ? "emerald" : "sky"}>
                        {ROLE_LABELS[row.role]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={row.is_active ? "emerald" : "neutral"}>
                        {row.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {row.has_2fa ? (
                        <Badge tone="emerald">2FA aktif</Badge>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelf}
                          onClick={() => setPending({ kind: "reset2fa", user: row })}
                        >
                          Reset 2FA
                        </Button>
                        {row.role === "parent" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPendingReset(row)}
                          >
                            Reset Sandi
                          </Button>
                        ) : null}
                        {row.is_active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSelf}
                            onClick={() =>
                              setPending({ kind: "deactivate", user: row })
                            }
                          >
                            Nonaktifkan
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSelf}
                            onClick={() =>
                              setPending({ kind: "activate", user: row })
                            }
                          >
                            Aktifkan kembali
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs font-semibold text-slate-500">
        Semua tindakan tercatat di Aktivitas
      </p>

      {pending && copy ? (
        <ConfirmDialog
          title={copy.title}
          body={copy.body}
          acting={acting}
          onCancel={() => setPending(null)}
          onConfirm={handleConfirm}
        />
      ) : null}

      {pendingReset ? (
        <ResetPasswordDialog
          parent={pendingReset}
          acting={acting}
          onCancel={() => setPendingReset(null)}
          onConfirm={(newPassword) => void handleResetPassword(newPassword)}
        />
      ) : null}

      {provisionOpen ? (
        <ProvisionParentDialog
          onClose={() => setProvisionOpen(false)}
          onDone={load}
        />
      ) : null}
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  acting,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  acting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !acting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [acting, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Konfirmasi: ${title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-700">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={acting}
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button size="sm" loading={acting} onClick={onConfirm}>
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordDialog({
  parent,
  acting,
  onCancel,
  onConfirm,
}: {
  parent: AdminUser;
  acting: boolean;
  onCancel: () => void;
  onConfirm: (newPassword: string) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !acting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [acting, onCancel]);

  function handleConfirm() {
    if (newPassword.length < 8) {
      setError("Kata sandi baru minimal 8 karakter");
      return;
    }
    onConfirm(newPassword);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Konfirmasi: Reset sandi ${parent.full_name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h2 className="text-base font-bold text-slate-900">
          Reset Sandi — {parent.full_name}
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Set sandi baru untuk {parent.email}. Sesi yang sedang aktif akan
          diakhiri.
        </p>
        <div className="mt-4">
          <label
            htmlFor="new-password"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Kata sandi baru
          </label>
          <input
            id="new-password"
            type="password"
            className={inputClasses}
            value={newPassword}
            minLength={8}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          {error ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
          ) : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={acting}
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button size="sm" loading={acting} onClick={handleConfirm}>
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProvisionParentDialog({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ProvisionedParent | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [saving, onClose]);

  function close() {
    if (created) onDone();
    onClose();
  }

  function handleSubmit() {
    const parsed = parentFormSchema.safeParse({
      email,
      full_name: fullName,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setSaving(true);
    setError(null);
    userApi
      .provisionParent({
        email: parsed.data.email,
        full_name: parsed.data.full_name,
        initial_password: generateInitialPassword(),
      })
      .then(setCreated)
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setSaving(false));
  }

  if (created) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Akun orang tua berhasil dibuat"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <button
          type="button"
          aria-label="Tutup"
          onClick={close}
          className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
        />
        <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
          <h2 className="text-base font-bold text-slate-900">
            Akun orang tua berhasil dibuat
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Kata sandi awal baru ditampilkan sekali ini saja. Kirim ke orang tua
            via WhatsApp sekarang.
          </p>
          <div className="mt-4">
            <label
              htmlFor="parent-initial-password"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Kata sandi awal{" "}
              <span className="font-normal text-slate-500">
                (hanya tampil sekali)
              </span>
            </label>
            <input
              id="parent-initial-password"
              type="text"
              readOnly
              value={created.initial_password}
              className={inputClasses}
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={close}>
              Tutup
            </Button>
            <Button
              size="sm"
              href={whatsappHandoff(created)}
              target="_blank"
              rel="noreferrer"
            >
              Salin &amp; kirim via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Orang Tua"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
      />
      <form
        className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <h2 className="text-base font-bold text-slate-900">Tambah Orang Tua</h2>
        <p className="mt-2 text-sm text-slate-700">
          Buat akun login untuk orang tua. Kata sandi awal dibuat otomatis dan
          dikirim via WhatsApp.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4">
          <div>
            <label
              htmlFor="parent-email"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Email <span className="text-rose-600">*</span>
            </label>
            <input
              id="parent-email"
              type="email"
              className={inputClasses}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {fieldErrors.email ? (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="parent-full-name"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Nama Lengkap <span className="text-rose-600">*</span>
            </label>
            <input
              id="parent-full-name"
              type="text"
              className={inputClasses}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            {fieldErrors.full_name ? (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {fieldErrors.full_name}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={onClose}
          >
            Batal
          </Button>
          <Button type="submit" size="sm" loading={saving}>
            Buat Akun
          </Button>
        </div>
      </form>
    </div>
  );
}
