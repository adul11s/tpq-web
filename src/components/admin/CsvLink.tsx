"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

export function CsvLink({
  url,
  label = "Ekspor CSV",
  fileName = "export.csv",
}: {
  url: string;
  label?: string;
  fileName?: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!API_BASE_URL) {
      setError("NEXT_PUBLIC_API_BASE_URL is not configured");
      return;
    }
    setError(null);
    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        credentials: "include",
      });
      if (!response.ok) {
        setError(
          response.status === 403
            ? "Anda tidak memiliki izin untuk mengekspor CSV."
            : "Gagal mengunduh CSV."
        );
        return;
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Gagal mengunduh CSV.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleDownload} loading={downloading}>
        {label}
      </Button>
      {error ? (
        <span role="alert" className="text-xs font-semibold text-rose-600">
          {error}
        </span>
      ) : null}
    </span>
  );
}
