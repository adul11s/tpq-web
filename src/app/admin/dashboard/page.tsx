"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { contentApi } from "@/lib/api/content";
import { inquiryAdminApi } from "@/lib/api/inquiries";
import type { AdminResource } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

const QUEUE_ENTITIES = [
  "classes",
  "resources",
  "prayer_guides",
  "pages",
  "teachers",
  "testimonials",
  "faqs",
] as const;

interface DashboardStats {
  totalDownloads: number;
  topResources: AdminResource[];
  newInquiries: number;
  pendingDrafts: number;
  newThisMonth: number;
}

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function countForMonth(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

const cardClasses =
  "rounded-2xl border border-mint-200 bg-white p-5 shadow-sm";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      contentApi.list<AdminResource>("resources"),
      inquiryAdminApi.list("new"),
      Promise.all(
        QUEUE_ENTITIES.map((entity) =>
          contentApi
            .list<Record<string, unknown>>(entity, { status: "draft" })
            .then((result) => result[entity] ?? [])
        )
      ),
    ])
      .then(([resourcesResult, inquiriesResult, draftGroups]) => {
        const resources = resourcesResult.resources ?? [];
        const sorted = [...resources].sort(
          (a, b) => b.download_count - a.download_count
        );
        setStats({
          totalDownloads: resources.reduce(
            (sum, row) => sum + (Number(row.download_count) || 0),
            0
          ),
          topResources: sorted.slice(0, 5),
          newInquiries: (inquiriesResult.inquiries ?? []).length,
          pendingDrafts: draftGroups.reduce(
            (sum, rows) => sum + rows.length,
            0
          ),
          newThisMonth: resources.filter((row) =>
            countForMonth(row.published_at)
          ).length,
        });
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">Dashboard</h2>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            load();
          }}
          className="rounded-lg border border-mint-300 bg-white px-3 py-1.5 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50"
        >
          Muat ulang
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {loading || !stats ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className={cardClasses}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
              Total Unduhan
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-mint-900">
              {stats.totalDownloads.toLocaleString("id-ID")}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              per counter, bukan GA4
            </p>
          </div>

          <div className={cardClasses}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
              Top 5 Materi
            </h3>
            <ol className="mt-2 space-y-1.5">
              {stats.topResources.map((row, index) => (
                <li
                  key={String(row.id)}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 truncate font-semibold text-slate-800">
                    <span className="mr-1.5 text-slate-400">{index + 1}.</span>
                    {row.title}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-mint-700">
                    {row.download_count.toLocaleString("id-ID")} unduhan
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className={cardClasses}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
              Inquiry Belum Dibalas
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-mint-900">
              {stats.newInquiries}
            </p>
            <Link
              href="/admin/inquiry"
              className="mt-1 inline-block text-xs font-bold text-mint-700 underline"
            >
              Buka inbox inquiry
            </Link>
          </div>

          <div className={cardClasses}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
              Menunggu Persetujuan
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-mint-900">
              {stats.pendingDrafts}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              draft menunggu persetujuan admin
            </p>
          </div>

          <div className={cardClasses}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
              Materi Baru Bulan Ini
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-mint-900">
              {stats.newThisMonth}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              materi dipublikasikan bulan ini
            </p>
          </div>

          <div className={cardClasses}>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
              Pengunjung (GA4)
            </h3>
            <p className="mt-2 text-3xl font-extrabold text-slate-300">
              {"\u2014"}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              tersedia setelah GA4 terpasang
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
