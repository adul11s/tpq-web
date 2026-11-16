"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { contentApi } from "@/lib/api/content";
import { inquiryAdminApi } from "@/lib/api/inquiries";
import {
  smsApi,
  type AttendanceRow,
  type Enrollment,
  type HafalanRecord,
  type RaporDocument,
  type RaporPeriod,
} from "@/lib/api/sms";
import { ENTITY_CONFIG } from "@/lib/admin/entities";
import { useSession } from "@/lib/admin/session";
import type { AdminResource, Role } from "@/lib/types/admin";

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

interface ContentStats {
  totalDownloads: number;
  topResources: AdminResource[];
  newInquiries: number;
  pendingDrafts: number;
  newThisMonth: number;
}

interface OperationalStats {
  activeStudents: number;
  attendanceRecorded: number;
  attendanceMissing: number;
  attendanceAlpha: number;
  staleHafalan: number;
  raporGenerated: number;
  raporMissing: number;
  raporPeriodLabel: string | null;
}

const EMPTY_CONTENT_STATS: ContentStats = {
  totalDownloads: 0,
  topResources: [],
  newInquiries: 0,
  pendingDrafts: 0,
  newThisMonth: 0,
};

const cardClasses =
  "rounded-2xl border border-mint-200 bg-white p-5 shadow-sm";

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

function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function operationalStats(
  enrollments: Enrollment[],
  attendance: AttendanceRow[],
  hafalan: HafalanRecord[],
  periods: RaporPeriod[],
  documents: RaporDocument[],
): OperationalStats {
  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "active",
  );
  const activeIds = new Set(
    activeEnrollments.map((enrollment) => enrollment.student_id),
  );
  const activeEnrollmentIds = new Set(
    activeEnrollments.map((enrollment) => enrollment.id),
  );
  const recorded = attendance.filter(
    (row) => activeEnrollmentIds.has(row.enrollment_id) && row.status !== null,
  );

  const latestHafalan = new Map<number, number>();
  for (const record of hafalan) {
    if (!activeIds.has(record.student_id)) continue;
    const updatedAt = new Date(record.updated_at).getTime();
    if (Number.isNaN(updatedAt)) continue;
    latestHafalan.set(
      record.student_id,
      Math.max(latestHafalan.get(record.student_id) ?? 0, updatedAt),
    );
  }
  const staleBefore = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const staleHafalan = [...activeIds].filter(
    (studentId) => (latestHafalan.get(studentId) ?? 0) < staleBefore,
  ).length;

  const period = periods
    .filter((item) => item.status === "open")
    .sort((a, b) => b.id - a.id)[0];
  const generatedIds = new Set(
    period
      ? documents
          .filter(
            (document) =>
              document.rapor_period_id === period.id &&
              activeIds.has(document.student_id),
          )
          .map((document) => document.student_id)
      : [],
  );

  return {
    activeStudents: activeIds.size,
    attendanceRecorded: recorded.length,
    attendanceMissing: Math.max(0, activeEnrollmentIds.size - recorded.length),
    attendanceAlpha: recorded.filter((row) => row.status === "alpha").length,
    staleHafalan,
    raporGenerated: generatedIds.size,
    raporMissing: period ? Math.max(0, activeIds.size - generatedIds.size) : 0,
    raporPeriodLabel: period
      ? `${period.semester === "ganjil" ? "Ganjil" : "Genap"} ${period.academic_year}`
      : null,
  };
}

function StatCard({
  title,
  value,
  detail,
  href,
  linkLabel,
}: {
  title: string;
  value: string | number;
  detail: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <article className={cardClasses}>
      <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
        {title}
      </h3>
      <p className="mt-2 text-3xl font-extrabold text-mint-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
      <Link
        href={href}
        className="mt-3 inline-block text-xs font-bold text-mint-700 underline"
      >
        {linkLabel}
      </Link>
    </article>
  );
}

export default function DashboardPage() {
  const { status, user } = useSession();
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [operations, setOperations] = useState<OperationalStats | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [operationsLoading, setOperationsLoading] = useState(true);
  const [failedGroups, setFailedGroups] = useState<string[]>([]);

  const loadContent = useCallback(() => {
    return Promise.allSettled([
      contentApi.list<AdminResource>("resources"),
      inquiryAdminApi.list("new"),
      ...QUEUE_ENTITIES.map((entity) =>
        contentApi.list<Record<string, unknown>>(entity, { status: "draft" }),
      ),
    ]).then((settled) => {
      const [resourcesResult, inquiriesResult, ...draftResults] = settled;
      const failed: string[] = [];
      const resources =
        resourcesResult.status === "fulfilled"
          ? resourcesResult.value.resources ?? []
          : (failed.push("Materi"), []);
      const inquiries =
        inquiriesResult.status === "fulfilled"
          ? inquiriesResult.value.inquiries ?? []
          : (failed.push("Inquiry"), []);
      const draftGroups = draftResults.map((result, index) => {
        if (result.status === "rejected") {
          failed.push(ENTITY_CONFIG[QUEUE_ENTITIES[index]].label);
          return [] as Record<string, unknown>[];
        }
        return result.value[QUEUE_ENTITIES[index]] ?? [];
      });
      const sorted = [...resources].sort(
        (a, b) => b.download_count - a.download_count,
      );
      setContentStats({
        totalDownloads: resources.reduce(
          (sum, row) => sum + (Number(row.download_count) || 0),
          0,
        ),
        topResources: sorted.slice(0, 5),
        newInquiries: inquiries.length,
        pendingDrafts: draftGroups.reduce((sum, rows) => sum + rows.length, 0),
        newThisMonth: resources.filter((row) => countForMonth(row.published_at))
          .length,
      });
      setFailedGroups((current) => [
        ...current.filter((group) => group.startsWith("Operasional:")),
        ...failed,
      ]);
      setContentLoading(false);
    });
  }, []);

  const loadOperations = useCallback(() => {
    return Promise.allSettled([
      smsApi.listEnrollments(),
      smsApi.listAttendance({ date: todayLocal() }),
      smsApi.listHafalan(),
      smsApi.listRaporPeriods(),
      smsApi.listRaporDocuments(),
    ]).then((settled) => {
      const labels = [
        "Santri",
        "Absensi",
        "Hafalan",
        "Periode rapor",
        "Dokumen rapor",
      ];
      const failed = settled.flatMap((result, index) =>
        result.status === "rejected" ? [`Operasional: ${labels[index]}`] : [],
      );
      setOperations(
        operationalStats(
          settled[0].status === "fulfilled" ? settled[0].value.enrollments : [],
          settled[1].status === "fulfilled" ? settled[1].value.attendance : [],
          settled[2].status === "fulfilled" ? settled[2].value.records : [],
          settled[3].status === "fulfilled" ? settled[3].value.periods : [],
          settled[4].status === "fulfilled" ? settled[4].value.documents : [],
        ),
      );
      setFailedGroups((current) => [
        ...current.filter((group) => !group.startsWith("Operasional:")),
        ...failed,
      ]);
      setOperationsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin" || user.role === "content_manager") {
      void loadContent();
    }
    if (user.role === "admin") void loadOperations();
  }, [user, loadContent, loadOperations]);

  if (status === "loading") {
    return (
      <p role="status" className="text-sm font-semibold text-slate-500">
        Memuat dashboard…
      </p>
    );
  }

  if (!user) return null;

  function reload(role: Role) {
    setFailedGroups([]);
    if (role === "admin" || role === "content_manager") {
      setContentLoading(true);
      void loadContent();
    }
    if (role === "admin") {
      setOperationsLoading(true);
      void loadOperations();
    }
  }

  const canReadContent =
    user?.role === "admin" || user?.role === "content_manager";
  const content = canReadContent
    ? contentStats ?? EMPTY_CONTENT_STATS
    : EMPTY_CONTENT_STATS;
  const viewContentLoading = canReadContent ? contentLoading : false;
  const attention = operations
    ? [
        {
          label: `${content.newInquiries} inquiry belum dibalas`,
          href: "/admin/inquiry",
          show: content.newInquiries > 0,
        },
        {
          label: `${operations.attendanceMissing} absensi belum dicatat hari ini`,
          href: "/admin/sms/absensi",
          show: operations.attendanceMissing > 0,
        },
        {
          label: `${operations.staleHafalan} santri tanpa pembaruan hafalan 14 hari`,
          href: "/admin/sms/hafalan",
          show: operations.staleHafalan > 0,
        },
        {
          label: `${operations.raporMissing} rapor belum dibuat untuk periode aktif`,
          href: "/admin/sms/rapor",
          show:
            operations.raporPeriodLabel !== null && operations.raporMissing > 0,
        },
      ].filter((item) => item.show)
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-mint-900">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan pekerjaan yang perlu ditindaklanjuti hari ini.
          </p>
        </div>
        <button
          type="button"
          disabled={
            !user ||
            (canReadContent && contentLoading) ||
            (user.role === "admin" && operationsLoading)
          }
          onClick={() => user && reload(user.role)}
          className="rounded-lg border border-mint-300 bg-white px-3 py-1.5 text-sm font-bold text-mint-700 transition-colors hover:bg-mint-50 disabled:opacity-60"
        >
          Muat ulang
        </button>
      </div>

      {failedGroups.length > 0 ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
        >
          Sebagian data gagal dimuat: {failedGroups.join(", ")}
        </p>
      ) : null}

      {user?.role === "admin" ? (
        <section aria-labelledby="operational-heading" className="space-y-4">
          <div>
            <h2
              id="operational-heading"
              className="text-lg font-bold text-mint-900"
            >
              Operasional hari ini
            </h2>
            <p className="text-sm text-slate-500">{todayLocal()}</p>
          </div>
          {operationsLoading || !operations ? (
            <p className="text-sm font-semibold text-slate-500">
              Memuat data operasional…
            </p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Santri Aktif"
                  value={operations.activeStudents}
                  detail="santri dengan pendaftaran kelas aktif"
                  href="/admin/sms/enrollments"
                  linkLabel="Kelola pendaftaran"
                />
                <StatCard
                  title="Absensi Hari Ini"
                  value={`${operations.attendanceRecorded}/${operations.attendanceRecorded + operations.attendanceMissing}`}
                  detail={`${operations.attendanceAlpha} alpa · ${operations.attendanceMissing} belum dicatat`}
                  href="/admin/sms/absensi"
                  linkLabel="Lengkapi absensi"
                />
                <StatCard
                  title="Hafalan Perlu Perhatian"
                  value={operations.staleHafalan}
                  detail="belum diperbarui dalam 14 hari"
                  href="/admin/sms/hafalan"
                  linkLabel="Buka pencatatan hafalan"
                />
                <StatCard
                  title="Rapor Periode Aktif"
                  value={
                    operations.raporPeriodLabel
                      ? `${operations.raporGenerated}/${operations.activeStudents}`
                      : "—"
                  }
                  detail={
                    operations.raporPeriodLabel ?? "belum ada periode rapor"
                  }
                  href="/admin/sms/rapor"
                  linkLabel="Kelola rapor"
                />
              </div>

              <div className={cardClasses}>
                <h3 className="font-bold text-mint-900">Perlu tindakan</h3>
                {attention.length > 0 ? (
                  <ul className="mt-3 grid gap-2 md:grid-cols-2">
                    {attention.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex min-h-11 items-center justify-between rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100"
                        >
                          {item.label}
                          <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm font-medium text-emerald-700">
                    Tidak ada tindakan mendesak dari data yang tersedia.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      ) : null}

      <section aria-labelledby="content-heading" className="space-y-4">
        <h2 id="content-heading" className="text-lg font-bold text-mint-900">
          Kinerja konten dan inquiry
        </h2>
        {viewContentLoading ? (
          <p className="text-sm font-semibold text-slate-500">
            Memuat data konten…
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Inquiry Belum Dibalas"
              value={content.newInquiries}
              detail="calon wali santri menunggu tindak lanjut"
              href="/admin/inquiry"
              linkLabel="Buka inbox inquiry"
            />
            <StatCard
              title="Menunggu Persetujuan"
              value={content.pendingDrafts}
              detail="draft konten menunggu persetujuan admin"
              href={user?.role === "admin" ? "/admin/persetujuan" : "/admin/konten"}
              linkLabel={
                user?.role === "admin"
                  ? "Buka antrean persetujuan"
                  : "Buka daftar konten"
              }
            />
            <StatCard
              title="Total Unduhan"
              value={content.totalDownloads.toLocaleString("id-ID")}
              detail={`${content.newThisMonth} materi dipublikasikan bulan ini`}
              href="/admin/konten/resources"
              linkLabel="Kelola materi"
            />
            <article className={`${cardClasses} md:col-span-2 xl:col-span-3`}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-mint-700">
                Top 5 Materi
              </h3>
              {content.topResources.length > 0 ? (
                <ol className="mt-3 grid gap-2 md:grid-cols-2">
                  {content.topResources.map((row, index) => (
                    <li
                      key={String(row.id)}
                      className="flex items-center justify-between gap-2 rounded-lg bg-mint-50 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate font-semibold text-slate-800">
                        <span className="mr-1.5 text-slate-400">
                          {index + 1}.
                        </span>
                        {row.title}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-mint-700">
                        {row.download_count.toLocaleString("id-ID")} unduhan
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Belum ada data unduhan.
                </p>
              )}
            </article>
          </div>
        )}
      </section>
    </div>
  );
}
