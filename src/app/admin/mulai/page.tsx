"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/admin/session";
import { smsApi } from "@/lib/api/sms";

export const dynamic = "force-dynamic";

interface SetupState {
  hasStudents: boolean;
  hasActiveEnrollment: boolean;
  hasGuardian: boolean;
  hasHafalan: boolean;
  hasRaporPeriod: boolean;
}

const EMPTY_SETUP: SetupState = {
  hasStudents: false,
  hasActiveEnrollment: false,
  hasGuardian: false,
  hasHafalan: false,
  hasRaporPeriod: false,
};

export default function MulaiPage() {
  const { status, user } = useSession();
  const [setup, setSetup] = useState<SetupState | null>(null);
  const [failedGroups, setFailedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return Promise.allSettled([
      smsApi.listStudents(),
      smsApi.listEnrollments(),
      smsApi.listGuardianships(),
      smsApi.listHafalan(),
      smsApi.listRaporPeriods(),
    ]).then((results) => {
      const labels = [
        "Santri",
        "Pendaftaran kelas",
        "Akun wali",
        "Hafalan",
        "Periode rapor",
      ];
      setFailedGroups(
        results.flatMap((result, index) =>
          result.status === "rejected" ? [labels[index]] : [],
        ),
      );
      setSetup({
        hasStudents:
          results[0].status === "fulfilled" &&
          results[0].value.students.length > 0,
        hasActiveEnrollment:
          results[1].status === "fulfilled" &&
          results[1].value.enrollments.some((row) => row.status === "active"),
        hasGuardian:
          results[2].status === "fulfilled" &&
          results[2].value.guardianships.length > 0,
        hasHafalan:
          results[3].status === "fulfilled" &&
          results[3].value.records.length > 0,
        hasRaporPeriod:
          results[4].status === "fulfilled" &&
          results[4].value.periods.length > 0,
      });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user?.role === "admin") void load();
  }, [user, load]);

  if (status === "loading") {
    return (
      <p role="status" className="text-sm font-semibold text-slate-500">
        Memuat panduan setup…
      </p>
    );
  }

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <p
        role="alert"
        className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        Panduan setup hanya tersedia untuk admin.
      </p>
    );
  }

  const current = setup ?? EMPTY_SETUP;
  const steps = [
    {
      title: "Tambahkan data santri",
      detail: "Masukkan identitas dasar santri yang akan dikelola.",
      href: "/admin/sms/students",
      done: current.hasStudents,
    },
    {
      title: "Daftarkan santri ke kelas",
      detail: "Pastikan minimal satu santri memiliki pendaftaran kelas aktif.",
      href: "/admin/sms/enrollments",
      done: current.hasActiveEnrollment,
    },
    {
      title: "Siapkan akses orang tua",
      detail: "Buat akun parent, lalu tautkan akun tersebut ke data santri.",
      href: "/admin/pengguna",
      done: current.hasGuardian,
    },
    {
      title: "Catat hafalan pertama",
      detail: "Mulai rekam progres hafalan agar perkembangan dapat dipantau.",
      href: "/admin/sms/hafalan",
      done: current.hasHafalan,
    },
    {
      title: "Buat periode rapor",
      detail: "Siapkan periode semester untuk penerbitan rapor santri.",
      href: "/admin/sms/rapor",
      done: current.hasRaporPeriod,
    },
  ];
  const completed = steps.filter((step) => step.done).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h2 className="text-xl font-bold text-mint-900">Panduan Setup</h2>
        <p className="mt-1 text-sm text-slate-500">
          Lima langkah minimum agar operasional TPQ siap dipakai dari santri
          sampai rapor.
        </p>
      </header>

      {failedGroups.length > 0 ? (
        <p
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
        >
          Sebagian progres tidak dapat diperiksa: {failedGroups.join(", ")}.
        </p>
      ) : null}

      {loading || !setup ? (
        <p role="status" className="text-sm font-semibold text-slate-500">
          Memeriksa kesiapan operasional…
        </p>
      ) : (
        <>
          <section className="rounded-2xl border border-mint-200 bg-mint-950 p-5 text-white shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-mint-300">
                  Kesiapan operasional
                </p>
                <p className="mt-1 text-3xl font-extrabold">
                  {completed} dari {steps.length} langkah
                </p>
              </div>
              <span className="text-lg font-bold text-mint-200">
                {Math.round((completed / steps.length) * 100)}%
              </span>
            </div>
            <progress
              aria-label="Progres setup TPQ"
              className="mt-4 h-2 w-full accent-emerald-400"
              max={steps.length}
              value={completed}
            />
            {completed === steps.length ? (
              <p className="mt-3 text-sm font-semibold text-emerald-300">
                Setup dasar selesai. Dashboard operasional siap digunakan.
              </p>
            ) : null}
          </section>

          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col items-start gap-4 rounded-2xl border border-mint-200 bg-white p-5 shadow-sm sm:flex-row"
              >
                <span
                  aria-hidden="true"
                  className={
                    step.done
                      ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-700"
                      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-extrabold text-slate-600"
                  }
                >
                  {step.done ? "✓" : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-mint-900">{step.title}</h3>
                    <span
                      className={
                        step.done
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"
                          : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800"
                      }
                    >
                      {step.done ? "Selesai" : "Belum selesai"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{step.detail}</p>
                </div>
                <Link
                  href={step.href}
                  className="w-full shrink-0 rounded-lg border border-mint-300 px-3 py-2 text-center text-sm font-bold text-mint-700 hover:bg-mint-50 sm:w-auto"
                >
                  Buka
                </Link>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void load();
            }}
            className="rounded-lg border border-mint-300 bg-white px-3 py-2 text-sm font-bold text-mint-700 hover:bg-mint-50 disabled:opacity-60"
            disabled={loading}
          >
            Periksa ulang progres
          </button>
        </>
      )}
    </div>
  );
}
