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
  onDownloaded?: (title: string) => void;
}

export function ResourceGrid({
  resources,
  isLoading,
  isPlaceholderData,
  lang,
  onDownloaded,
}: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl border border-mint-100 bg-white"
          >
            <Skeleton className="aspect-[4/3] rounded-none bg-mint-100" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4 bg-mint-100" />
              <Skeleton className="h-3 w-full bg-mint-100" />
              <Skeleton className="h-3 w-1/2 bg-mint-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          lang={lang}
          onDownloaded={onDownloaded}
          className={isPlaceholderData ? "opacity-60" : ""}
        />
      ))}
    </div>
  );
}
