"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api/users";
import { useSession } from "@/lib/admin/session";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminUser } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  admin: "Administrator",
  content_manager: "Pengelola Konten",
};

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
      <h2 className="mb-4 text-xl font-bold text-mint-900">Pengguna</h2>

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
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
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
