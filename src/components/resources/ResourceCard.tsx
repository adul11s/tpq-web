"use client";

import Image from "next/image";
import Link from "next/link";
import { CategoryIllustration } from "@/components/resources/CategoryIllustration";
import { useDownload } from "@/hooks/useDownload";
import { localizedHref, type Lang } from "@/lib/lang";
import { AGE_GROUP_LABELS, CATEGORY_LABELS } from "@/lib/types/api";
import type { ResourceCategorySlug } from "@/lib/types/api";
import type { ResourceSummary } from "@/lib/types/resource";

interface ResourceCardProps {
  resource: ResourceSummary;
  lang: Lang;
  onDownloaded?: (title: string) => void;
  className?: string;
}

function formatCount(count: number): string {
  return new Intl.NumberFormat("id-ID").format(count);
}

const CATEGORY_TINTS: Record<ResourceCategorySlug, string> = {
  prayers: "bg-sky-100 text-sky-700",
  calligraphy: "bg-gold-100 text-gold-700",
  coloring: "bg-rose-100 text-rose-700",
  readings: "bg-violet-100 text-violet-700",
  documents: "bg-mint-100 text-mint-700",
};

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path d="M12 3v10m0 0-4-4m4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm4 6a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

export function ResourceCard({
  resource,
  lang,
  onDownloaded,
  className = "",
}: ResourceCardProps) {
  const { download, isDownloading } = useDownload(resource, lang);
  const detailHref = localizedHref(lang, `/resources/${resource.slug}`);
  const isPlaceholderThumb = resource.thumbnailUrl.startsWith("/placeholders/");

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border border-mint-100 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <Link
        href={detailHref}
        className="relative block aspect-[4/3] overflow-hidden bg-mint-100"
        aria-label={`Pratinjau ${resource.title}`}
      >
        {isPlaceholderThumb ? (
          <CategoryIllustration category={resource.category.slug} />
        ) : (
          <Image
            src={resource.thumbnailUrl}
            alt={`Thumbnail ${resource.title}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${CATEGORY_TINTS[resource.category.slug] ?? "bg-mint-100 text-mint-700"}`}
        >
          <CategoryIcon />
          {CATEGORY_LABELS[resource.category.slug] ?? resource.category.name}
        </span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-mint-800 shadow-sm">
          <svg
            className="h-3.5 w-3.5 text-mint-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
          </svg>
          {AGE_GROUP_LABELS[resource.ageGroup]}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-base font-bold text-mint-900">
          <Link
            href={detailHref}
            className="transition-colors hover:text-mint-700"
          >
            {resource.title}
          </Link>
        </h3>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-mint-800/70">
          {resource.description ?? "Materi pembelajaran untuk anak."}
        </p>

        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="text-xs font-bold text-mint-800/60">
            {formatCount(resource.downloadCount)}×{" "}
            {lang === "en" ? "downloaded" : "diunduh"}
          </span>
          <button
            type="button"
            aria-label={`Unduh PDF ${resource.title}`}
            disabled={isDownloading}
            onClick={async () => {
              await download();
              onDownloaded?.(resource.title);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
          >
            <DownloadIcon />
            {isDownloading
              ? lang === "en"
                ? "Downloading…"
                : "Mengunduh…"
              : lang === "en"
                ? "Download"
                : "Unduh"}
          </button>
        </div>
      </div>
    </article>
  );
}
