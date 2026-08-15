"use client";

import { useDeferredValue, useState } from "react";
import { FilterBar } from "@/components/resources/FilterBar";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { Button } from "@/components/ui/Button";
import { useResources } from "@/hooks/useResources";
import type { Lang } from "@/lib/lang";
import type {
  AgeFilter,
  CategoryFilter,
} from "@/lib/types/resource";

const PAGE_SIZE = 8;

interface ResourcesDashboardProps {
  lang: Lang;
}

export function ResourcesDashboard({ lang }: ResourcesDashboardProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [ageGroup, setAgeGroup] = useState<AgeFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);

  const { data, isLoading, isPlaceholderData, isError } = useResources({
    category,
    ageGroup,
    q: deferredQuery || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const resources = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        {lang === "en" ? "Downloads & Materials" : "Materi & Unduhan"}
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        {lang === "en"
          ? "Daily prayers, readings, coloring pages, and calligraphy to support learning at home. All materials are ready to download and print."
          : "Doa harian, bacaan, lembar mewarnai, dan kaligrafi untuk menemani belajar anak di rumah. Semua materi siap diunduh dan dicetak."}
      </p>

      <div className="mt-8">
        <FilterBar
          category={category}
          ageGroup={ageGroup}
          query={query}
          onCategoryChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
          onAgeGroupChange={(value) => {
            setAgeGroup(value);
            setPage(1);
          }}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-8">
        {isError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 py-16 text-center text-sm text-red-700">
            {lang === "en"
              ? "Failed to load materials. Please try again later."
              : "Gagal memuat materi. Silakan coba lagi nanti."}
          </p>
        ) : (
          <ResourceGrid
            resources={resources}
            isLoading={isLoading}
            isPlaceholderData={isPlaceholderData}
            lang={lang}
          />
        )}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label={lang === "en" ? "Page navigation" : "Navigasi halaman"}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            {lang === "en" ? "Previous" : "Sebelumnya"}
          </Button>
          <span className="text-sm text-slate-600">
            {lang === "en" ? `Page ${page} of ${totalPages}` : `Halaman ${page} dari ${totalPages}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            {lang === "en" ? "Next" : "Berikutnya"}
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
