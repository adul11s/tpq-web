"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { contentApi, saveChildRows, toApiError } from "@/lib/api/content";
import { ENTITY_CONFIG } from "@/lib/admin/entities";
import { EntityForm } from "@/components/admin/EntityForm";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/admin/session";
import type { ContentApiError } from "@/lib/api/content";

export const dynamic = "force-dynamic";

export default function KontenEditorPage() {
  const { entity, id } = useParams<{ entity: string; id: string }>();
  const config = ENTITY_CONFIG[entity];
  const { user } = useSession();
  const router = useRouter();

  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [children, setChildren] = useState<Record<string, Record<string, unknown>[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<ContentApiError | null>(null);
  const [busy, setBusy] = useState(false);

  const childFields = useMemo(
    () =>
      config?.fields.filter(
        (field) => field.type === "schedule" || field.type === "curriculum"
      ) ?? [],
    [config]
  );

  useEffect(() => {
    contentApi
      .preview(entity, Number(id))
      .then(setRow)
      .catch((err: unknown) => setLoadError(toApiError(err).message))
      .finally(() => setLoading(false));
    if (childFields.length > 0) {
      Promise.all(
        childFields.map((field) =>
          contentApi
            .list(field.name)
            .then((result) => ({ name: field.name, rows: result[field.name] ?? [] }))
            .catch(() => ({ name: field.name, rows: [] }))
        )
      ).then((groups) => {
        const classId = Number(id);
        setChildren(
          Object.fromEntries(
            groups.map((group) => [
              group.name,
              group.rows.filter((item) => Number(item.class_id) === classId),
            ])
          )
        );
      });
    }
  }, [entity, id, childFields]);

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

  const initialValues = row
    ? {
        ...Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key, value ?? ""])
        ),
        ...Object.fromEntries(
          childFields.map((field) => [field.name, children[field.name] ?? []])
        ),
      }
    : undefined;

  async function handleSave(values: Record<string, unknown>) {
    setBusy(true);
    setServerError(null);
    try {
      await contentApi.update(entity, Number(id), values);
      for (const field of childFields) {
        await saveChildRows(
          field.name,
          Number(id),
          (values[field.name] as Record<string, unknown>[]) ?? []
        );
      }
      router.push(`/admin/konten/${entity}`);
    } catch (err) {
      setServerError(toApiError(err));
      setBusy(false);
    }
  }

  async function handlePublish() {
    setBusy(true);
    setServerError(null);
    try {
      await contentApi.publish(entity, Number(id));
      router.push(`/admin/konten/${entity}`);
    } catch (err) {
      setServerError(toApiError(err));
      setBusy(false);
    }
  }

  async function handleArchive() {
    setBusy(true);
    setServerError(null);
    try {
      await contentApi.archive(entity, Number(id));
      router.push(`/admin/konten/${entity}`);
    } catch (err) {
      setServerError(toApiError(err));
      setBusy(false);
    }
  }

  const isAdmin = user?.role === "admin";
  const isDraft = row?.status === "draft";
  const isPublished = row?.status === "published";

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">
          Edit {config.label}
        </h2>
        <Link
          href={`/admin/konten/${entity}`}
          className="text-sm font-bold text-mint-600 transition-colors hover:text-mint-700"
        >
          &larr; Kembali ke daftar
        </Link>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {loadError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : null}

      {!loading && !loadError ? (
        <>
          {serverError ? (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
            >
              <p>{serverError.message}</p>
              {serverError.fields
                ? Object.entries(serverError.fields).map(([field, message]) => (
                    <p key={field}>{message}</p>
                  ))
                : null}
            </div>
          ) : null}

          <EntityForm
            entity={config}
            initialValues={initialValues}
            submitLabel="Simpan Draft"
            submitting={busy}
            onSubmit={handleSave}
          />

          {isAdmin ? (
            <div className="mt-4 flex gap-2">
              {isDraft ? (
                <Button
                  variant="secondary"
                  loading={busy}
                  onClick={handlePublish}
                >
                  Terbitkan
                </Button>
              ) : null}
              {isPublished ? (
                <Button
                  variant="outline"
                  loading={busy}
                  onClick={handleArchive}
                >
                  Arsipkan
                </Button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
