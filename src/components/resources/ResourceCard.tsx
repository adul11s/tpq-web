"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useDownload } from "@/hooks/useDownload";
import { localizedHref, type Lang } from "@/lib/lang";
import { AGE_GROUP_LABELS, CATEGORY_LABELS } from "@/lib/types/api";
import type { ResourceSummary } from "@/lib/types/resource";

interface ResourceCardProps {
  resource: ResourceSummary;
  lang: Lang;
  onDownloaded?: () => void;
  className?: string;
}

function formatCount(count: number): string {
  return new Intl.NumberFormat("id-ID").format(count);
}

export function ResourceCard({
  resource,
  lang,
  onDownloaded,
  className = "",
}: ResourceCardProps) {
  const { download, isDownloading } = useDownload(resource, lang);
  const detailHref = localizedHref(lang, `/resources/${resource.slug}`);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <Link
        href={detailHref}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
        aria-label={`Pratinjau ${resource.title}`}
      >
        <Image
          src={resource.thumbnailUrl}
          alt={`Thumbnail ${resource.title}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <Badge
          tone="amber"
          className="absolute left-3 top-3 shadow-sm"
        >
          {CATEGORY_LABELS[resource.category.slug] ?? resource.category.name}
        </Badge>
        <Badge
          tone="emerald"
          className="absolute bottom-3 left-3 shadow-sm"
        >
          {AGE_GROUP_LABELS[resource.ageGroup]}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold text-slate-900">
          <Link
            href={detailHref}
            className="transition-colors hover:text-emerald-700"
          >
            {resource.title}
          </Link>
        </h3>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
          {resource.description ?? "Materi pembelajaran untuk anak."}
        </p>

        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="text-xs text-slate-500">
            {formatCount(resource.downloadCount)}× {lang === "en" ? "downloaded" : "diunduh"}
          </span>
          <Button
            size="sm"
            loading={isDownloading}
            onClick={async () => {
              await download();
              onDownloaded?.();
            }}
          >
            {lang === "en" ? "Download" : "Unduh"}
          </Button>
        </div>
      </div>
    </article>
  );
}
