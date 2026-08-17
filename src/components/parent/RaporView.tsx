"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/client";
import {
  parentApi,
  type ParentChild,
  type ParentRaporDownload,
  type ParentRaporMeta,
} from "@/lib/api/parent";
import { localizedHref, pick, type Lang } from "@/lib/lang";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

type RaporState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "missing" }
  | { status: "error" }
  | {
      status: "ready";
      meta: ParentRaporMeta;
      download: ParentRaporDownload;
      child: ParentChild | null;
    };

type RaporResult = Exclude<RaporState, { status: "loading" }>;

function formatBytes(bytes: number, lang: Lang): string {
  const locale = lang === "en" ? "en-US" : "id-ID";
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toLocaleString(locale, {
      maximumFractionDigits: 1,
    })} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function formatDate(value: string | null, lang: Lang): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  const locale = lang === "en" ? "en-US" : "id-ID";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function semesterLabel(semester: "ganjil" | "genap"): string {
  return semester === "ganjil" ? "Ganjil" : "Genap";
}

function RaporCard({
  lang,
  state,
}: {
  lang: Lang;
  state: Extract<RaporState, { status: "ready" }>;
}) {
  const { meta, download, child } = state;
  const period = child?.rapor_periods.find(
    (p) => p.period_id === meta.rapor_period_id,
  );
  const periodLine = period
    ? `${semesterLabel(period.semester)} ${period.academic_year}`
    : null;
  const subParts = [periodLine, child?.class].filter(
    (part): part is string => part !== null && part !== undefined,
  );

  return (
    <section className="mt-5 rounded-3xl border border-mint-100 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold text-mint-900">
        {child ? child.full_name : pick(lang, "Rapor", "Report")}
      </h2>
      {subParts.length > 0 ? (
        <p className="mt-0.5 text-xs font-bold text-mint-800/60">
          {subParts.join(" · ")}
        </p>
      ) : null}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="font-bold text-mint-800/50">
            {pick(lang, "Ukuran file", "File size")}
          </dt>
          <dd className="font-extrabold text-mint-900">
            {formatBytes(meta.file_size, lang)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="font-bold text-mint-800/50">
            {pick(lang, "Diterbitkan", "Published")}
          </dt>
          <dd className="font-extrabold text-mint-900">
            {formatDate(meta.finalized_at, lang)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={download.download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-mint-200 bg-white px-4 text-xs font-extrabold text-mint-800 transition-colors hover:border-mint-300 hover:bg-mint-50"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {pick(lang, "Lihat", "View")}
        </a>
        <a
          href={download.download_url}
          download={download.file_name}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-mint-600 px-4 text-xs font-extrabold text-white shadow-md shadow-mint-600/25 transition-colors hover:bg-mint-700"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v10m0 0-4-4m4 4 4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          {pick(lang, "Unduh PDF", "Download PDF")}
        </a>
      </div>
    </section>
  );
}

export function RaporView({
  lang,
  studentId,
  periodId,
}: {
  lang: Lang;
  studentId: number;
  periodId: number;
}) {
  const [state, setState] = useState<RaporState>({ status: "loading" });

  const load = useCallback(async (): Promise<RaporResult> => {
    try {
      const [meta, download, childrenResult] = await Promise.all([
        parentApi.rapor(studentId, periodId),
        parentApi.raporDownload(studentId, periodId),
        parentApi.children().catch(() => null),
      ]);
      const child =
        childrenResult?.children.find((c) => c.student_id === studentId) ??
        null;
      return { status: "ready", meta, download, child };
    } catch (caught) {
      const apiError = caught instanceof ApiError ? caught : null;
      if (apiError?.status === 403) {
        return { status: "denied" };
      }
      if (apiError?.status === 404) {
        return { status: "missing" };
      }
      return { status: "error" };
    }
  }, [studentId, periodId]);

  useEffect(() => {
    let cancelled = false;
    void load().then((result) => {
      if (!cancelled) {
        setState(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    void load().then(setState);
  }, [load]);

  return (
    <div className="relative">
      <Link
        href={localizedHref(lang, "/parent/anak")}
        className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-bold text-mint-700 transition-colors hover:text-mint-900"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
        </svg>
        {pick(lang, "Kembali ke Anak Saya", "Back to My Children")}
      </Link>

      <h1 className="mt-6 font-display text-2xl font-bold text-mint-900">
        {pick(lang, "Unduh Rapor", "Download Report")}
      </h1>
      <p className="mt-1 text-sm font-semibold text-mint-800/60">
        {lang === "en"
          ? "Open or download the semester PDF."
          : "Lihat atau unduh PDF rapor semester."}
      </p>

      {state.status === "loading" ? (
        <div
          role="status"
          aria-label={pick(lang, "Memuat data rapor", "Loading report")}
          className="mt-5 space-y-4"
        >
          <Skeleton className="h-32 w-full rounded-3xl" />
        </div>
      ) : state.status === "denied" ? (
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
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            title={pick(
              lang,
              "Bukan anak Anda — akses ditolak.",
              "Not your child — access denied.",
            )}
            hint={pick(
              lang,
              "Hubungi pihak sekolah jika ini keliru.",
              "Contact the school if this is wrong.",
            )}
          />
        </div>
      ) : state.status === "missing" ? (
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="M9 15h6m-6 3h4" />
              </svg>
            }
            title={pick(
              lang,
              "Rapor belum tersedia",
              "Report not available yet",
            )}
            hint={pick(
              lang,
              "Hubungi pihak sekolah jika ini keliru.",
              "Contact the school if this is wrong.",
            )}
          />
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
      ) : (
        <RaporCard lang={lang} state={state} />
      )}
    </div>
  );
}
