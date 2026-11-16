"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { parentApi, type ParentChild } from "@/lib/api/parent";
import { localizedHref, pick, type Lang } from "@/lib/lang";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; children: ParentChild[] };

function initialOf(fullName: string): string {
  return fullName.trim().charAt(0).toUpperCase() || "?";
}

function metaOf(child: ParentChild): string {
  const parts = [child.class, child.nis ? `NIS ${child.nis}` : null];
  return parts.filter((part) => part !== null).join(" · ");
}

function RaporChip({ lang }: { lang: Lang }) {
  return (
    <span className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-mint-200 bg-mint-50 px-4 text-xs font-extrabold text-mint-800/60">
      {pick(lang, "Rapor belum tersedia", "Not available yet")}
    </span>
  );
}

function semesterLabel(
  semester: ParentChild["rapor_periods"][number]["semester"],
  lang: Lang,
): string {
  if (semester === "ganjil") return pick(lang, "Ganjil", "Odd");
  return pick(lang, "Genap", "Even");
}

function RaporLinks({
  child,
  lang,
}: {
  child: ParentChild;
  lang: Lang;
}) {
  if (child.rapor_periods.length === 0) {
    return <RaporChip lang={lang} />;
  }
  return (
    <div className="flex flex-wrap gap-2 sm:justify-end">
      {child.rapor_periods.map((period, index) => {
        const label = `${semesterLabel(period.semester, lang)} ${period.academic_year}`;
        return (
          <Link
            key={period.period_id}
            href={localizedHref(
              lang,
              `/parent/rapor/${child.student_id}/${period.period_id}`,
            )}
            aria-label={pick(
              lang,
              `Lihat rapor ${label}`,
              `View report ${label}`,
            )}
            className={
              index === 0
                ? "inline-flex min-h-11 shrink-0 items-center rounded-full bg-mint-600 px-4 text-xs font-extrabold text-white transition-colors hover:bg-mint-700"
                : "inline-flex min-h-11 shrink-0 items-center rounded-full border border-mint-200 bg-white px-4 text-xs font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function ChildCard({ child, lang }: { child: ParentChild; lang: Lang }) {
  return (
    <li
      role="listitem"
      className="rounded-3xl border border-mint-100 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 font-display text-xl font-bold text-sky-700"
        >
          {initialOf(child.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold text-mint-900">
            {child.full_name}
          </h2>
          <p className="text-xs font-bold text-mint-800/60">{metaOf(child)}</p>
        </div>
        <RaporLinks child={child} lang={lang} />
      </div>
    </li>
  );
}

export function ChildrenList({ lang }: { lang: Lang }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const fetchChildren = useCallback(async () => {
    try {
      const result = await parentApi.children();
      setState({ status: "ready", children: result.children });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    parentApi
      .children()
      .then((result) =>
        setState({ status: "ready", children: result.children }),
      )
      .catch(() => setState({ status: "error" }));
  }, []);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    void fetchChildren();
  }, [fetchChildren]);

  return (
    <div className="relative">
      <h1 className="font-display text-2xl font-bold text-mint-900">
        {pick(lang, "Anak Saya", "My Children")}
      </h1>
      <p className="mt-1 text-sm font-semibold text-mint-800/60">
        {lang === "en"
          ? "Select a child to view the semester report."
          : "Pilih anak untuk melihat rapor semester."}
      </p>

      {state.status === "loading" ? (
        <div
          role="status"
          aria-label={pick(lang, "Memuat data anak", "Loading children data")}
          className="mt-5 space-y-4"
        >
          <Skeleton className="h-24 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : state.status === "error" ? (
        <div className="mt-5">
          <ErrorState
            message={pick(
              lang,
              "Terjadi kesalahan. Coba lagi nanti.",
              "Something went wrong. Please try again later.",
            )}
            retryLabel={pick(lang, "Coba Lagi", "Try Again")}
            onRetry={retry}
          />
        </div>
      ) : state.children.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={
              <svg
                className="h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
              </svg>
            }
            title={pick(
              lang,
              "Belum ada anak terhubung",
              "No children connected yet",
            )}
            hint={pick(
              lang,
              "Hubungi pihak sekolah jika ini keliru.",
              "Contact the school if this is wrong.",
            )}
          />
        </div>
      ) : (
        <ul role="list" className="mt-5 space-y-4">
          {state.children.map((child) => (
            <ChildCard key={child.student_id} child={child} lang={lang} />
          ))}
        </ul>
      )}
    </div>
  );
}
