"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { contentApi, toApiError } from "@/lib/api/content";
import { ENTITY_CONFIG } from "@/lib/admin/entities";
import { EntityForm } from "@/components/admin/EntityForm";
import type { ContentApiError } from "@/lib/api/content";

export const dynamic = "force-dynamic";

export default function KontenNewPage() {
  const { entity } = useParams<{ entity: string }>();
  const config = ENTITY_CONFIG[entity];
  const router = useRouter();

  const [serverError, setServerError] = useState<ContentApiError | null>(null);
  const [busy, setBusy] = useState(false);

  if (!config) {
    return (
      <p className="text-sm font-semibold text-slate-600">
        Konten tidak ditemukan.
      </p>
    );
  }

  async function handleCreate(values: Record<string, unknown>) {
    setBusy(true);
    setServerError(null);
    try {
      await contentApi.create(entity, values);
      router.push(`/admin/konten/${entity}`);
    } catch (err) {
      setServerError(toApiError(err));
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">
          Buat {config.label} Baru
        </h2>
        <Link
          href={`/admin/konten/${entity}`}
          className="text-sm font-bold text-mint-600 transition-colors hover:text-mint-700"
        >
          &larr; Kembali ke daftar
        </Link>
      </div>

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
        submitLabel="Simpan Draft"
        submitting={busy}
        onSubmit={handleCreate}
      />
    </div>
  );
}
