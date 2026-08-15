"use client";

import { AGE_GROUP_LABELS, CATEGORY_LABELS } from "@/lib/types/api";
import type { AgeFilter, CategoryFilter } from "@/lib/types/resource";

interface FilterBarProps {
  category: CategoryFilter;
  ageGroup: AgeFilter;
  query: string;
  onCategoryChange: (category: CategoryFilter) => void;
  onAgeGroupChange: (ageGroup: AgeFilter) => void;
  onQueryChange: (query: string) => void;
}

const selectClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:w-auto";

export function FilterBar({
  category,
  ageGroup,
  query,
  onCategoryChange,
  onAgeGroupChange,
  onQueryChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="filter-search">
        Cari materi
      </label>
      <input
        id="filter-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Cari materi…"
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      />

      <label className="sr-only" htmlFor="filter-category">
        Kategori
      </label>
      <select
        id="filter-category"
        value={category}
        onChange={(event) =>
          onCategoryChange(event.target.value as CategoryFilter)
        }
        className={selectClasses}
      >
        <option value="all">Semua kategori</option>
        {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
          <option key={slug} value={slug}>
            {label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-age">
        Kelompok usia
      </label>
      <select
        id="filter-age"
        value={ageGroup}
        onChange={(event) =>
          onAgeGroupChange(event.target.value as AgeFilter)
        }
        className={selectClasses}
      >
        <option value="all">Semua usia</option>
        {Object.entries(AGE_GROUP_LABELS).map(([age, label]) => (
          <option key={age} value={age}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
