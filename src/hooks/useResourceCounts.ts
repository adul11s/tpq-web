"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchResources } from "@/lib/data/resources";
import type { ResourceSummary } from "@/lib/types/resource";

const PAGE_CAP = 100;

export function useResourceCounts(): Record<string, number> {
  const first = useQuery({
    queryKey: ["resource-counts", 1],
    queryFn: () => fetchResources({ page: 1, pageSize: PAGE_CAP }),
  });

  const pagesNeeded = first.data
    ? Math.max(1, Math.ceil(first.data.meta.total / PAGE_CAP))
    : 1;

  const rest = useQueries({
    queries: Array.from({ length: pagesNeeded - 1 }, (_, index) => ({
      queryKey: ["resource-counts", index + 2],
      queryFn: () => fetchResources({ page: index + 2, pageSize: PAGE_CAP }),
      enabled: first.isSuccess && pagesNeeded > 1,
    })),
  });

  return useMemo(() => {
    const lists: ResourceSummary[][] = [
      first.data?.data ?? [],
      ...rest.map((query) => query.data?.data ?? []),
    ];
    const result: Record<string, number> = { all: 0 };
    for (const resource of lists.flat()) {
      result.all += 1;
      result[resource.category.slug] = (result[resource.category.slug] ?? 0) + 1;
    }
    return result;
  }, [first.data, rest]);
}
