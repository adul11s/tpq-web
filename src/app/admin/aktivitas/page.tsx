"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auditApi, AUDIT_ACTIONS, AUDIT_ACTION_LABELS } from "@/lib/api/audit";
import type { AuditAction, AuditListResult } from "@/lib/api/audit";
import { userApi } from "@/lib/api/users";
import { useSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/Button";
import { CsvLink } from "@/components/admin/CsvLink";
import type { AdminAuditRow, AdminUser } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const EMPTY = "\u2014";

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("id-ID");
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

function truncate(text: string, max = 48): string {
  return text.length <= max ? text : `${text.slice(0, max)}\u2026`;
}

function actionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action as AuditAction] ?? action;
}

function entityLabel(row: AdminAuditRow): string {
  if (row.entity_type === null) return EMPTY;
  return row.entity_id === null
    ? row.entity_type
    : `${row.entity_type} \u00b7 ${row.entity_id}`;
}

export default function AktivitasPage() {
  const { user } = useSession();
  const router = useRouter();

  const [rows, setRows] = useState<AdminAuditRow[]>([]);
  const [meta, setMeta] = useState<AuditListResult["meta"] | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [action, setAction] = useState<AuditAction | "">("");
  const [userId, setUserId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    auditApi
      .list({
        ...(action ? { action } : {}),
        ...(userId ? { userId } : {}),
        page,
        pageSize: PAGE_SIZE,
      })
      .then((result) => {
        setRows(result.data);
        setMeta(result.meta);
        setError(null);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [action, userId, page]);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load, tick]);

  useEffect(() => {
    if (user?.role === "admin") {
      userApi
        .list()
        .then((result) => setUsers(result.users))
        .catch(() => setUsers([]));
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  const userEmailById = new Map(users.map((u) => [u.id, u.email]));

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

  const totalPages = meta?.total_pages ?? 1;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">Aktivitas</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              setTick((t) => t + 1);
            }}
            loading={loading}
          >
            Muat ulang
          </Button>
          <CsvLink url={auditApi.exportUrl()} fileName="audit.csv" />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          Aksi
          <select
            aria-label="Aksi"
            value={action}
            onChange={(event) => {
              setAction(event.target.value as AuditAction | "");
              setPage(1);
              setLoading(true);
              setError(null);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800"
          >
            <option value="">Semua aksi</option>
            {AUDIT_ACTIONS.map((item) => (
              <option key={item} value={item}>
                {AUDIT_ACTION_LABELS[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          Pengguna
          <select
            aria-label="Pengguna"
            value={userId}
            onChange={(event) => {
              const value = event.target.value;
              setUserId(value === "" ? "" : Number(value));
              setPage(1);
              setLoading(true);
              setError(null);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800"
          >
            <option value="">Semua pengguna</option>
            {users.map((item) => (
              <option key={item.id} value={item.id}>
                {item.email}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : rows.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Tidak ada aktivitas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">Tanggal</th>
                <th className="px-3 py-2.5 font-semibold">Pengguna</th>
                <th className="px-3 py-2.5 font-semibold">Aksi</th>
                <th className="px-3 py-2.5 font-semibold">Entitas</th>
                <th className="px-3 py-2.5 font-semibold">IP</th>
                <th className="px-3 py-2.5 font-semibold">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {formatCreatedAt(row.created_at)}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-mint-900">
                    {userEmailById.get(row.user_id) ?? String(row.user_id)}
                  </td>
                  <td className="px-3 py-2.5">{actionLabel(row.action)}</td>
                  <td className="px-3 py-2.5 text-slate-700">
                    {entityLabel(row)}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">
                    {row.ip ?? EMPTY}
                  </td>
                  <td
                    className="max-w-[280px] truncate px-3 py-2.5 text-slate-500"
                    title={row.user_agent ?? undefined}
                  >
                    {row.user_agent ? truncate(row.user_agent) : EMPTY}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          Halaman {page} dari {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => p - 1);
              setLoading(true);
              setError(null);
            }}
          >
            {"\u003c"} Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setPage((p) => p + 1);
              setLoading(true);
              setError(null);
            }}
          >
            Berikutnya {"\u003e"}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        Menampilkan 50 aktivitas terbaru, ekspor CSV memuat seluruh riwayat.
      </p>
    </div>
  );
}
