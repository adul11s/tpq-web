"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "@/lib/data/classes";
import type { ClassSummary } from "@/lib/types/class";

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    staleTime: 10 * 60 * 1000,
  });
}

export type { ClassSummary };
