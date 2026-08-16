"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { FilterBar } from "@/components/resources/FilterBar";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Toast } from "@/components/ui/Toast";
import { useResourceCounts } from "@/hooks/useResourceCounts";
import { useResources } from "@/hooks/useResources";
import type { Lang } from "@/lib/lang";
import { CATEGORY_LABELS } from "@/lib/types/api";
import type {
  AgeFilter,
  CategoryFilter,
} from "@/lib/types/resource";

const PAGE_SIZE = 8;

interface ResourcesDashboardProps {
  lang: Lang;
}

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5 text-mint-800/40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-mint-700"
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

function CrescentIcon() {
  return (
    <svg className="h-4 w-4 text-gold-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function ResourcesDashboard({ lang }: ResourcesDashboardProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [ageGroup, setAgeGroup] = useState<AgeFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    actionLabel: string;
    actionHref: string;
  } | null>(null);
  const deferredQuery = useDeferredValue(query);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isPlaceholderData, isError, refetch } = useResources({
    category,
    ageGroup,
    q: deferredQuery || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const counts = useResourceCounts();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get("category");
    if (!param || !(param === "all" || param in CATEGORY_LABELS)) {
      return;
    }
    const categoryParam = param as CategoryFilter;
    const timer = window.setTimeout(() => setCategory(categoryParam), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const resources = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const total = data?.meta.total ?? 0;

  const clearFilters = () => {
    setCategory("all");
    setAgeGroup("all");
    setQuery("");
    setPage(1);
  };

  const showDownloadToast = (title: string) => {
    const shareText = `Halo, saya baru saja mengunduh materi "${title}" dari TPQ Qur'ani.`;
    setToast({
      title: lang === "en" ? "Thank you!" : "Terima kasih!",
      message:
        lang === "en"
          ? `PDF ${title} is ready to download.`
          : `PDF ${title} siap diunduh.`,
      actionLabel:
        lang === "en" ? "Share via WhatsApp" : "Bagikan via WhatsApp",
      actionHref: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 6000);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
        <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="orb animate-floaty -right-24 -top-24 h-72 w-72 bg-mint-200" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-mint-700 shadow-sm">
              <CrescentIcon />
              {lang === "en"
                ? "Download Center for Learning Materials"
                : "Pusat Unduhan Materi Belajar"}
            </p>
            <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-mint-900 sm:text-5xl">
              {lang === "en" ? (
                <>Assalamu&rsquo;alaikum, <span className="text-gold-600">Dear Parents!</span></>
              ) : (
                <>Assalamu&rsquo;alaikum, <span className="text-gold-600">Ayah &amp; Bunda!</span></>
              )}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-mint-900/70">
              {lang === "en"
                ? "Find daily prayers, calligraphy, and coloring sheets to support learning at home. All materials are ready to download and print."
                : "Temukan doa harian, kaligrafi, dan lembar mewarnai untuk menemani ananda belajar di rumah. Semua materi siap diunduh dan dicetak."}
            </p>

            <form
              role="search"
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="sr-only" htmlFor="material-search">
                {lang === "en" ? "Search materials" : "Cari materi"}
              </label>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <SearchIcon />
                </span>
                <input
                  id="material-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={
                    lang === "en" ? "Search materials…" : "Cari materi…"
                  }
                  className="h-12 w-full rounded-full border border-mint-200 bg-white pl-12 pr-11 text-sm text-mint-900 shadow-sm placeholder:text-mint-800/40 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-500/30"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label={lang === "en" ? "Clear search" : "Hapus pencarian"}
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-mint-800/50 transition-colors hover:bg-mint-50 hover:text-mint-800"
                  >
                    <CloseIcon />
                  </button>
                ) : null}
              </div>
              <button
                type="submit"
                onClick={() => setPage(1)}
                className="inline-flex h-12 min-w-28 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-on-primary shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover"
              >
                {lang === "en" ? "Search" : "Cari"}
              </button>
            </form>

            <ul className="mt-6 flex flex-col gap-2 text-sm font-bold text-mint-800/80 sm:flex-row sm:flex-wrap sm:gap-x-6">
              <li className="flex items-center gap-2">
                <CheckIcon />
                {lang === "en" ? "Free for parents of students" : "Gratis untuk wali santri"}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                {lang === "en" ? "Print-ready PDF format" : "Format PDF siap cetak"}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon />
                {lang === "en"
                  ? "Tip: on mobile, long-press the download button to save the file"
                  : "Tip: di HP, tahan lama tombol unduh untuk menyimpan berkas"}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-mint-900 sm:text-3xl">
              {lang === "en" ? "Explore Materials" : "Jelajahi Materi"}
            </h2>
            <p className="mt-2 text-sm font-semibold text-mint-800/70">
              {lang === "en"
                ? "Pick a category or type a keyword to narrow the results."
                : "Pilih kategori atau ketik kata kunci untuk mempersempit hasil."}
            </p>
          </div>
          <p
            aria-live="polite"
            className="rounded-full bg-mint-100 px-4 py-1.5 text-sm font-extrabold text-mint-700"
          >
            {lang === "en"
              ? `${total} ${total === 1 ? "material" : "materials"}`
              : `${total} materi`}
          </p>
        </div>

        <div className="mt-6">
          <FilterBar
            lang={lang}
            category={category}
            ageGroup={ageGroup}
            counts={counts}
            onCategoryChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            onAgeGroupChange={(value) => {
              setAgeGroup(value);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-8">
          {isError ? (
            <ErrorState
              message={
                lang === "en"
                  ? "Materials are being fixed. Please try again later."
                  : "Materi sedang diperbaiki. Coba lagi nanti."
              }
              retryLabel={lang === "en" ? "Try Again" : "Coba Lagi"}
              onRetry={() => refetch()}
            />
          ) : resources.length === 0 && !isLoading ? (
            <EmptyState
              icon={
                <svg
                  className="h-10 w-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              }
              title="Tidak ada materi ditemukan"
              hint={
                lang === "en"
                  ? "Try changing the filters or search for another keyword."
                  : "Coba ubah filter atau cari kata lain."
              }
              ctaLabel={lang === "en" ? "Clear Filters" : "Hapus Filter"}
              onCta={clearFilters}
            />
          ) : (
            <ResourceGrid
              resources={resources}
              isLoading={isLoading}
              isPlaceholderData={isPlaceholderData}
              lang={lang}
              onDownloaded={showDownloadToast}
            />
          )}
        </div>

        <p className="no-print mt-8 rounded-2xl border border-mint-100 bg-mint-50 px-5 py-4 text-center text-sm font-bold text-mint-800">
          {lang === "en"
            ? "Tip: on mobile, long-press the Download button to save the PDF file."
            : "Tip: di HP, tahan lama tombol Unduh untuk menyimpan berkas PDF."}
        </p>

        {totalPages > 1 ? (
          <nav
            aria-label={lang === "en" ? "Page navigation" : "Navigasi halaman"}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-mint-200 bg-white px-5 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50 disabled:pointer-events-none disabled:opacity-50"
            >
              {lang === "en" ? "Previous" : "Sebelumnya"}
            </button>
            <span className="text-sm font-bold text-mint-800/70">
              {lang === "en"
                ? `Page ${page} of ${totalPages}`
                : `Halaman ${page} dari ${totalPages}`}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-mint-200 bg-white px-5 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50 disabled:pointer-events-none disabled:opacity-50"
            >
              {lang === "en" ? "Next" : "Berikutnya"}
            </button>
          </nav>
        ) : null}
      </section>

      {toast ? (
        <Toast
          title={toast.title}
          message={toast.message}
          actionLabel={toast.actionLabel}
          actionHref={toast.actionHref}
        />
      ) : null}
    </>
  );
}
