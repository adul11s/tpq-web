"use client";

import { useEffect, useRef, useState } from "react";
import { mediaApi, toMediaError, type MediaApiError } from "@/lib/api/media";
import type { AdminMediaAsset } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.gif";
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
]);

const KIND_LABEL: Record<string, string> = { pdf: "PDF", image: "Gambar" };

const badgeClasses: Record<string, string> = {
  pdf: "bg-rose-100 text-rose-700",
  image: "bg-sky-100 text-sky-700",
};

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

export default function MediaPage() {
  const [assets, setAssets] = useState<AdminMediaAsset[]>([]);
  const [error, setError] = useState<MediaApiError | null>(null);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [typeWarning, setTypeWarning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const { media } = await mediaApi.list();
      setAssets(media);
    } catch {
      setError({ status: 0, message: "Gagal memuat media." });
    }
  }

  useEffect(() => {
    mediaApi
      .list()
      .then(({ media }) => setAssets(media))
      .catch(() => setError({ status: 0, message: "Gagal memuat media." }));
  }, []);

  async function handleFile(file: File) {
    setError(null);
    setSizeWarning(false);
    setTypeWarning(false);
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      setTypeWarning(true);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setSizeWarning(true);
      return;
    }
    setUploading(true);
    try {
      await mediaApi.upload(file);
      await load();
    } catch (err) {
      setError(toMediaError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-xl font-bold text-mint-900">Media</h2>
      <p className="mt-1 text-sm text-slate-600">
        Unggah file untuk dipakai di konten, atau pilih file yang sudah ada.
      </p>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer?.files?.[0];
          if (file) void handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className="mt-5 cursor-pointer rounded-2xl border-2 border-dashed border-mint-300 bg-white p-8 text-center transition-colors hover:border-mint-400 hover:bg-mint-50"
      >
        <p className="text-sm font-bold text-mint-800">
          Tarik file ke sini untuk mengunggah
        </p>
        <p className="mt-1 text-xs text-slate-500">
          atau klik untuk memilih file &mdash; PDF, JPG, PNG, GIF (maks 5 MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          aria-label="Pilih file untuk diunggah"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>

      {sizeWarning ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
        >
          File lebih dari 5 MB &mdash; maksimal 5 MB per file. Kompres file
          Anda lalu coba lagi.
        </div>
      ) : null}

      {typeWarning ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
        >
          Format file tidak didukung {"\u2014"} gunakan PDF, JPG, PNG, atau GIF.
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          <p>{error.message}</p>
          {error.status === 413 ? (
            <p className="mt-1 text-xs font-medium">
              Gunakan alat kompresi (mis. Smallpdf atau docsmall) untuk
              memperkecil file sebelum mengunggah ulang.
            </p>
          ) : null}
        </div>
      ) : null}

      {uploading ? (
        <div role="status" aria-live="polite" className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded bg-mint-100">
            <div className="h-full w-1/3 animate-pulse rounded bg-mint-500" />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-mint-700">
            Mengunggah\u2026
          </p>
        </div>
      ) : null}

      <h3 className="mt-8 text-sm font-bold uppercase tracking-widest text-slate-500">
        Perpustakaan Media
      </h3>

      {assets.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Belum ada media.</p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {asset.original_name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(asset.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-slate-600">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    badgeClasses[asset.kind] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {KIND_LABEL[asset.kind] ?? asset.kind}
                </span>
                <span>{formatMegabytes(asset.file_size)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
