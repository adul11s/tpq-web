"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfPreviewProps {
  url: string | null;
}

export function PdfPreview({ url }: PdfPreviewProps) {
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  if (!url) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        Pratinjau belum tersedia untuk materi ini.
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        Gagal memuat pratinjau. Silakan unduh file untuk melihat isinya.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        onLoadError={() => setError(true)}
        loading={
          <p className="py-16 text-sm text-slate-500">Memuat pratinjau…</p>
        }
      >
        {Array.from({ length: pageCount ?? 1 }, (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={640}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mb-3 rounded-md shadow-md"
          />
        ))}
      </Document>
      <p className="text-xs text-slate-500">
        {pageCount ? `${pageCount} halaman` : "Pratinjau PDF"}
      </p>
    </div>
  );
}
