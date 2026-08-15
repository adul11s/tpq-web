"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PreviewModal } from "@/components/resources/PreviewModal";
import { Button } from "@/components/ui/Button";
import { useDownload } from "@/hooks/useDownload";
import type { Lang } from "@/lib/lang";
import type { ResourceDetail } from "@/lib/types/resource";

const PdfPreview = dynamic(
  () =>
    import("@/components/resources/PdfPreview").then(
      (module) => module.PdfPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="py-16 text-center text-sm text-slate-500">
        Memuat pratinjau…
      </p>
    ),
  },
);

interface ResourceActionsProps {
  resource: ResourceDetail;
  lang: Lang;
}

export function ResourceActions({ resource, lang }: ResourceActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { download, isDownloading } = useDownload(resource, lang);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" loading={isDownloading} onClick={download}>
          {lang === "en" ? "Download PDF" : "Unduh PDF"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => setPreviewOpen(true)}
        >
          {lang === "en" ? "Preview" : "Lihat Pratinjau"}
        </Button>
      </div>

      <PreviewModal
        open={previewOpen}
        title={resource.title}
        onClose={() => setPreviewOpen(false)}
      >
        {previewOpen ? (
          <PdfPreview url={resource.previewUrl ?? resource.fileUrl} />
        ) : null}
      </PreviewModal>
    </>
  );
}
