"use client";

import { AGE_GROUP_LABELS } from "@/lib/types/api";
import type { AgeFilter, CategoryFilter } from "@/lib/types/resource";

interface FilterBarProps {
  category: CategoryFilter;
  ageGroup: AgeFilter;
  counts: Record<string, number>;
  onCategoryChange: (category: CategoryFilter) => void;
  onAgeGroupChange: (ageGroup: AgeFilter) => void;
}

const CATEGORY_CHIPS: { slug: CategoryFilter; id: string; en: string }[] = [
  { slug: "all", id: "Semua", en: "All" },
  { slug: "prayers", id: "Doa Harian", en: "Daily Prayers" },
  { slug: "calligraphy", id: "Kaligrafi", en: "Calligraphy" },
  { slug: "coloring", id: "Mewarnai", en: "Coloring" },
  { slug: "readings", id: "Bacaan", en: "Prayer Readings" },
];

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FilterBar({
  category,
  ageGroup,
  counts,
  onCategoryChange,
  onAgeGroupChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="group"
        aria-label="Filter kategori materi"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0 lg:justify-start"
      >
        {CATEGORY_CHIPS.map((chip) => {
          const active = category === chip.slug;
          const count = counts[chip.slug] ?? 0;
          return (
            <button
              key={chip.slug}
              type="button"
              aria-pressed={active}
              onClick={() => onCategoryChange(chip.slug)}
              className={
                active
                  ? "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-left text-on-primary shadow-md shadow-primary/20"
                  : "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-mint-200 bg-white px-4 py-2 text-left text-mint-700 transition-colors hover:bg-mint-50"
              }
            >
              {active ? <CheckIcon /> : null}
              <span>
                <span className="block text-sm font-extrabold leading-tight">
                  {chip.id}
                </span>
                <span
                  className={`block text-[10px] font-bold uppercase tracking-wide ${
                    active ? "text-mint-100" : "text-mint-800/50"
                  }`}
                >
                  {chip.en}
                </span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-mint-100 text-mint-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <label className="sr-only" htmlFor="filter-age">
        Kelompok usia
      </label>
      <select
        id="filter-age"
        value={ageGroup}
        onChange={(event) =>
          onAgeGroupChange(event.target.value as AgeFilter)
        }
        className="h-11 shrink-0 rounded-full border border-mint-200 bg-white px-4 text-sm font-bold text-mint-700 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30"
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
