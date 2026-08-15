"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchResourceBySlug, fetchResources } from "@/lib/data/resources";
import type { ResourceFilters, ResourceSummary } from "@/lib/types/resource";

export function useResources(filters: ResourceFilters) {
  return useQuery({
    queryKey: ["resources", filters],
    queryFn: () => fetchResources(filters),
    placeholderData: (previous) => previous,
  });
}

export function useResourceDetail(slug: string) {
  return useQuery({
    queryKey: ["resource", slug],
    queryFn: () => fetchResourceBySlug(slug),
  });
}

export type { ResourceSummary };
