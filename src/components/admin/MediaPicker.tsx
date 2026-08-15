"use client";

import { useEffect, useState } from "react";
import { mediaApi } from "@/lib/api/media";
import type { AdminMediaAsset } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

export type MediaPickerKind = "pdf" | "image" | "all";

export interface MediaPickerProps {
  kind: MediaPickerKind;
  value: number | null;
  onChange: (id: number) => void;
  triggerId?: string;
}

const KIND_LABEL: Record<string, string> = { pdf: "PDF", image: "Gambar" };

const badgeClasses: Record<string, string> = {
  pdf: "bg-rose-100 text-rose-700",
  image: "bg-sky-100 text-sky-700",
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200";

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function MediaPicker({
  kind,
  value,
  onChange,
  triggerId,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (value === null) return;
    let active = true;
    mediaApi
      .list()
      .then(({ media }) => {
        if (active) setAssets(media);
      })
      .catch(() => {
        // keep the current list when the endpoint is unavailable
      });
    return () => {
      active = false;
    };
  }, [value]);

  async function openPicker() {
    setQuery("");
    try {
      const { media } = await mediaApi.list();
      setAssets(media);
    } catch {
      // keep the current list when the endpoint is unavailable
    }
    setOpen(true);
  }

  const selected = assets.find((asset) => asset.id === value) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const visible = assets.filter(
    (asset) =>
      (kind === "all" || asset.kind === kind) &&
      (!normalizedQuery ||
        asset.original_name.toLowerCase().includes(normalizedQuery))
  );

  return (
    <>
      <Button
        type="button"
        id={triggerId}
        variant="outline"
        className="w-full justify-between"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPicker}
      >
        <span className="truncate">
          {selected ? selected.original_name : "Pilih Media"}
        </span>
        <span aria-hidden="true">&hellip;</span>
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pilih Media"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-bold text-slate-900">Pilih Media</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Tutup
              </Button>
            </div>
            <div className="px-5 pt-4">
              <input
                type="search"
                aria-label="Cari media"
                placeholder="Cari media\u2026"
                className={inputClasses}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <ul className="flex-1 space-y-2 overflow-auto px-5 py-4">
              {visible.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(asset.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">
                        {asset.original_name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {formatDate(asset.created_at)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-slate-600">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          badgeClasses[asset.kind] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {KIND_LABEL[asset.kind] ?? asset.kind}
                      </span>
                      <span>{formatMegabytes(asset.file_size)}</span>
                    </span>
                  </button>
                </li>
              ))}
              {visible.length === 0 ? (
                <li className="py-6 text-center text-sm text-slate-500">
                  Tidak ada media yang cocok.
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
