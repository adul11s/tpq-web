"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { contentApi } from "@/lib/api/content";
import { ENTITY_CONFIG } from "@/lib/admin/entities";
import { EntityTable } from "@/components/admin/EntityTable";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/admin/session";
import type { ContentStatus } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { value: ContentStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Publik" },
  { value: "archived", label: "Arsip" },
];

const chipClasses = (active: boolean): string =>
  active
    ? "rounded-full bg-mint-600 px-4 py-1.5 text-sm font-bold text-white"
    : "rounded-full border border-mint-300 bg-white px-4 py-1.5 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50";

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

export default function KontenListPage() {
  const { entity } = useParams<{ entity: string }>();
  const config = ENTITY_CONFIG[entity];
  const { user } = useSession();
  const router = useRouter();

  const [filter, setFilter] = useState<ContentStatus | "all">("all");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    contentApi
      .list(entity, filter === "all" ? undefined : { status: filter })
      .then((result) => setRows(result[entity] ?? []))
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [entity, filter]);

  useEffect(() => {
    if (config) load();
  }, [config, load]);

  if (!config) {
    return (
      <p className="text-sm font-semibold text-slate-600">
        Konten tidak ditemukan.
      </p>
    );
  }
  if (!user) return null;
  if (!config.roles.includes(user.role)) {
    router.replace("/admin");
    return (
      <p
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        Halaman ini khusus untuk admin.
      </p>
    );
  }

  function selectFilter(value: ContentStatus | "all") {
    setLoading(true);
    setError(null);
    setFilter(value);
  }

  async function handlePublish(row: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      await contentApi.publish(entity, Number(row.id));
      load();
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  async function handleArchive(row: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      await contentApi.archive(entity, Number(row.id));
      load();
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">{config.label}</h2>
        <Button href={`/admin/konten/${entity}/baru`}>Buat Baru</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter status">
        {STATUS_FILTERS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            aria-pressed={filter === chip.value}
            onClick={() => selectFilter(chip.value)}
            className={chipClasses(filter === chip.value)}
          >
            {chip.label}
          </button>
        ))}
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
        <p className="text-sm font-semibold text-slate-500">Memuat…</p>
      ) : (
        <EntityTable
          entity={config}
          rows={rows}
          role={user.role}
          onEdit={(row) =>
            router.push(`/admin/konten/${entity}/${String(row.id)}`)
          }
          onPublish={handlePublish}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
}
