"use client";

import { useCallback, useState } from "react";
import { requestResourceDownload } from "@/lib/data/resources";
import { trackDownload } from "@/lib/gtag";
import type { Lang } from "@/lib/lang";
import type { ResourceSummary } from "@/lib/types/resource";

interface UseDownloadResult {
  download: () => Promise<void>;
  isDownloading: boolean;
}

export function useDownload(
  resource: ResourceSummary,
  lang: Lang,
): UseDownloadResult {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async () => {
    setIsDownloading(true);
    try {
      const { downloadUrl, fileName } = await requestResourceDownload(resource.id);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();

      trackDownload({
        event: "download_material",
        resource_id: resource.id,
        resource_title: resource.title,
        category: resource.category.slug,
        age_group: resource.ageGroup,
        language: lang,
      });
    } finally {
      setIsDownloading(false);
    }
  }, [resource, lang]);

  return { download, isDownloading };
}
