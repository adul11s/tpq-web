"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { contentApi } from "@/lib/api/content";
import { ENTITY_CONFIG } from "@/lib/admin/entities";
import { PreviewModal } from "@/components/resources/PreviewModal";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const QUEUE_ENTITIES = [
  "classes",
  "resources",
  "prayer_guides",
  "pages",
  "teachers",
  "testimonials",
  "faqs",
] as const;

interface QueueItem {
  entity: string;
  row: Record<string, unknown>;
}

function titleOf(entity: string, row: Record<string, unknown>): string {
  switch (entity) {
    case "classes":
      return String(row.code ?? row.name ?? "");
    case "resources":
      return String(row.title ?? "");
    case "prayer_guides":
      return String(row.occasion ?? "");
    case "pages":
      return String(row.title_id ?? "");
    case "teachers":
      return String(row.name ?? "");
    case "testimonials":
      return String(row.parent_name ?? "");
    case "faqs":
      return String(row.question ?? "");
    default:
      return String(row.title ?? row.name ?? "");
  }
}

function displayDate(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "\u2014";
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("id-ID");
}

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function fieldDisplay(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return typeof value === "object"
    ? JSON.stringify(value, null, 2)
    : String(value);
}

export default function PersetujuanPage() {
  const { user } = useSession();
  const router = useRouter();

  const [filter, setFilter] = useState<string>("all");
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedGroups, setFailedGroups] = useState<string[]>([]);
  const [preview, setPreview] = useState<QueueItem | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const load = useCallback(() => {
    const entities = filter === "all" ? QUEUE_ENTITIES : [filter];
    Promise.allSettled(
      entities.map((entity) =>
        contentApi.list<Record<string, unknown>>(entity, {
          status: "draft",
        })
      )
    )
      .then((results) => {
        const merged: QueueItem[] = [];
        const failed: string[] = [];
        results.forEach((result, index) => {
          const entity = entities[index];
          if (result.status === "rejected") {
            failed.push(ENTITY_CONFIG[entity].label);
            return;
          }
          const rows = (result.value[entity] ?? [])
            .filter((row) => String(row.status ?? "draft") === "draft")
            .map((row) => ({ entity, row }));
          merged.push(...rows);
        });
        merged.sort((a, b) => {
          const aTime = new Date(String(a.row.created_at ?? "")).getTime();
          const bTime = new Date(String(b.row.created_at ?? "")).getTime();
          return bTime - aTime;
        });
        setItems(merged);
        setFailedGroups(failed);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/admin");
    }
  }, [user, router]);

  async function handlePublish(entity: string, row: Record<string, unknown>) {
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

  async function handleArchive(entity: string, row: Record<string, unknown>) {
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

  async function handlePreview(entity: string, row: Record<string, unknown>) {
    setPreview({ entity, row });
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const data = await contentApi.preview<Record<string, unknown>>(
        entity,
        Number(row.id)
      );
      setPreviewData(data);
    } catch (err) {
      setPreviewError(errorMessage(err));
    } finally {
      setPreviewLoading(false);
    }
  }

  const previewEntity = preview?.entity ?? "";

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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">Menunggu Persetujuan</h2>
        <div className="flex items-center gap-2">
          <label
            htmlFor="entity-filter"
            className="text-sm font-semibold text-slate-600"
          >
            Entitas
          </label>
          <select
            id="entity-filter"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setLoading(true);
              setError(null);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800"
          >
            <option value="all">Semua</option>
            {QUEUE_ENTITIES.map((entity) => (
              <option key={entity} value={entity}>
                {ENTITY_CONFIG[entity].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {failedGroups.length > 0 ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
        >
          Sebagian data gagal dimuat: {failedGroups.join(", ")}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Tidak ada konten menunggu persetujuan.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">Entitas</th>
                <th className="px-3 py-2.5 font-semibold">Judul</th>
                <th className="px-3 py-2.5 font-semibold">Dibuat oleh</th>
                <th className="px-3 py-2.5 font-semibold">Dibuat pada</th>
                <th className="px-3 py-2.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ entity, row }) => (
                <tr
                  key={`${entity}-${String(row.id)}`}
                  className="border-b border-slate-100"
                >
                  <td className="px-3 py-2.5 font-semibold text-mint-900">
                    {ENTITY_CONFIG[entity].label}
                  </td>
                  <td className="px-3 py-2.5">{titleOf(entity, row)}</td>
                  <td className="px-3 py-2.5">
                    {row.created_by !== null && row.created_by !== undefined
                      ? String(row.created_by)
                      : "\u2014"}
                  </td>
                  <td className="px-3 py-2.5">{displayDate(row.created_at)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(entity, row)}
                      >
                        Pratinjau
                      </Button>
                      {ENTITY_CONFIG[entity].publishable ? (
                        <Button
                          size="sm"
                          onClick={() => handlePublish(entity, row)}
                        >
                          Terbitkan
                        </Button>
                      ) : null}
                      {ENTITY_CONFIG[entity].archivable ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchive(entity, row)}
                        >
                          Arsipkan
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PreviewModal
        open={preview !== null}
        title={preview ? `Pratinjau: ${titleOf(preview.entity, preview.row)}` : ""}
        onClose={() => setPreview(null)}
      >
        {previewLoading ? (
          <p className="text-sm font-semibold text-slate-500">Memuat…</p>
        ) : previewError ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {previewError}
          </p>
        ) : previewData ? (
          <dl className="grid gap-3">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Entitas
              </dt>
              <dd className="text-sm font-semibold text-slate-900">
                {ENTITY_CONFIG[previewEntity].label}
              </dd>
            </div>
            {Object.entries(previewData).map(([key, value]) => {
              const display = fieldDisplay(value);
              if (display === null) return null;
              return (
                <div key={key}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {key}
                  </dt>
                  <dd className="whitespace-pre-wrap break-words text-sm text-slate-800">
                    {display}
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : null}
      </PreviewModal>
    </div>
  );
}
