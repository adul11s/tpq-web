"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { contentApi } from "@/lib/api/content";
import { useSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const PRIVACY_POLICY_VERSION_KEY = "privacy_policy_version";

interface SiteSettingRow {
  id: number;
  key: string;
  value: unknown;
  description: string | null;
  updated_by: number | null;
  updated_at: string;
}

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function initialDraft(row: SiteSettingRow): string {
  return JSON.stringify(row.value, null, 2);
}

export default function PengaturanPage() {
  const { user } = useSession();
  const router = useRouter();

  const [rows, setRows] = useState<SiteSettingRow[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    contentApi
      .list<SiteSettingRow>("site_settings")
      .then((result) => {
        const list = result.site_settings ?? [];
        setRows(list);
        setDrafts(
          Object.fromEntries(list.map((row) => [row.id, initialDraft(row)]))
        );
      })
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

  async function handleSave(row: SiteSettingRow) {
    const text = drafts[row.id] ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setErrors((prev) => ({
        ...prev,
        [row.id]: "JSON tidak valid — periksa tanda kutip, koma, dan kurung.",
      }));
      return;
    }
    setSaving((prev) => ({ ...prev, [row.id]: true }));
    setErrors((prev) => ({ ...prev, [row.id]: "" }));
    try {
      await contentApi.update("site_settings", row.id, { value: parsed });
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, value: parsed } : r
        )
      );
      setSaved((prev) => ({ ...prev, [row.id]: true }));
      window.setTimeout(() => {
        setSaved((prev) => ({ ...prev, [row.id]: false }));
      }, 2500);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [row.id]: errorMessage(err),
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [row.id]: false }));
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">Pengaturan Situs</h2>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            load();
          }}
          className="rounded-lg border border-mint-300 bg-white px-3 py-1.5 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50"
        >
          Muat ulang
        </button>
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
      ) : rows.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada pengaturan.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-mint-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-mono text-sm font-bold text-mint-900">
                  {row.key}
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  diubah {new Date(row.updated_at).toLocaleString("id-ID")}
                </span>
              </div>
              {row.description ? (
                <p className="mt-1 text-xs font-medium text-slate-600">
                  {row.description}
                </p>
              ) : null}
              {row.key === PRIVACY_POLICY_VERSION_KEY ? (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  Perubahan memaksa ulang persetujuan orang tua{" "}
                  {"\u2014"} sesuaikan dengan versi halaman Kebijakan Privasi.
                </p>
              ) : null}
              <label
                htmlFor={`site-setting-${row.id}`}
                className="mt-3 block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Nilai (JSON)
              </label>
              <textarea
                id={`site-setting-${row.id}`}
                aria-label={`Nilai ${row.key}`}
                value={drafts[row.id] ?? ""}
                onChange={(event) => {
                  setDrafts((prev) => ({
                    ...prev,
                    [row.id]: event.target.value,
                  }));
                  if (errors[row.id]) {
                    setErrors((prev) => ({ ...prev, [row.id]: "" }));
                  }
                }}
                spellCheck={false}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                rows={4}
              />
              {errors[row.id] ? (
                <p
                  role="alert"
                  className="mt-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                >
                  {errors[row.id]}
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  loading={saving[row.id]}
                  onClick={() => handleSave(row)}
                >
                  Simpan {row.key}
                </Button>
                {saved[row.id] ? (
                  <span className="text-xs font-bold text-emerald-600">
                    Tersimpan
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
