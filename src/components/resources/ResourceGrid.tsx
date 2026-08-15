"use client";

import { ResourceCard } from "@/components/resources/ResourceCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Lang } from "@/lib/lang";
import type { ResourceSummary } from "@/lib/types/resource";

interface ResourceGridProps {
  resources: ResourceSummary[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  lang: Lang;
  emptyMessage?: string;
}

export function ResourceGrid({
  resources,
  isLoading,
  isPlaceholderData,
  lang,
  emptyMessage = "Belum ada materi yang cocok dengan filter ini.",
}: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          lang={lang}
          className={isPlaceholderData ? "opacity-60" : ""}
        />
      ))}
    </div>
  );
}
