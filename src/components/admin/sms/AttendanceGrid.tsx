"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { contentApi } from "@/lib/api/content";
import {
  smsApi,
  type AttendanceStatus,
  type Enrollment,
} from "@/lib/api/sms";
import type { AdminClass } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "hadir", label: "Hadir" },
  { value: "izin", label: "Izin" },
  { value: "sakit", label: "Sakit" },
  { value: "alpha", label: "Alpa" },
];

const STATUS_CHIP_TONES: Record<
  AttendanceStatus,
  "bg-mint-100 text-mint-700" | "bg-sky-100 text-sky-700" | "bg-gold-100 text-gold-700" | "bg-rose-100 text-rose-600"
> = {
  hadir: "bg-mint-100 text-mint-700",
  izin: "bg-sky-100 text-sky-700",
  sakit: "bg-gold-100 text-gold-700",
  alpha: "bg-rose-100 text-rose-600",
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function AttendanceGrid({
  role = "admin",
}: {
  role?: "admin" | "teacher";
}) {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [date, setDate] = useState(todayLocal);
  const [drafts, setDrafts] = useState<Record<number, AttendanceStatus>>({});
  const [draftsKey, setDraftsKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const attendanceSeq = useRef(0);

  const loadBase = useCallback(() => {
    Promise.all([
      smsApi.listEnrollments(),
      contentApi.list<AdminClass>("classes"),
    ])
      .then(([enrollmentsRes, classesRes]) => {
        setEnrollments(enrollmentsRes.enrollments);
        setClasses(classesRes.classes);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  const effectiveClassId = selectedClassId ?? classes[0]?.id;

  const loadAttendance = useCallback((classId: number, dateValue: string) => {
    const seq = ++attendanceSeq.current;
    smsApi
      .listAttendance({ class_id: classId, date: dateValue })
      .then((res) => {
        if (seq !== attendanceSeq.current) return;
        setDraftsKey(`${classId}|${dateValue}`);
        setDrafts(
          Object.fromEntries(
            res.attendance.map((row) => [row.enrollment_id, row.status ?? "hadir"])
          )
        );
      })
      .catch((err: unknown) => {
        if (seq !== attendanceSeq.current) return;
        setError(errorMessage(err));
      })
      .finally(() => {
        if (seq === attendanceSeq.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (effectiveClassId === undefined) return;
    loadAttendance(effectiveClassId, date);
  }, [effectiveClassId, date, loadAttendance]);

  const roster = enrollments.filter(
    (enrollment) =>
      enrollment.class_id === effectiveClassId && enrollment.status === "active"
  );

  const currentKey =
    effectiveClassId !== undefined ? `${effectiveClassId}|${date}` : null;
  const draftsStale = currentKey !== draftsKey;
  const activeDrafts = draftsStale ? {} : drafts;

  const counts: Record<AttendanceStatus, number> = {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  };
  for (const enrollment of roster) {
    counts[activeDrafts[enrollment.id] ?? "hadir"] += 1;
  }

  const selectedClass = classes.find(
    (classRow) => classRow.id === effectiveClassId
  );

  function handleSave() {
    if (currentKey === null || currentKey !== draftsKey || roster.length === 0) {
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(null);
    smsApi
      .postAttendance({
        class_id: effectiveClassId as number,
        date,
        records: roster.map((enrollment) => ({
          enrollment_id: enrollment.id,
          status: activeDrafts[enrollment.id] ?? "hadir",
        })),
      })
      .then(() => setSaved("Absensi tersimpan"))
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setSaving(false));
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      ) : null}
      {saved ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          {saved}
        </p>
      ) : null}

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="attendance-date"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Tanggal
          </label>
          <input
            id="attendance-date"
            type="date"
            className={inputClasses}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="min-w-56 flex-1">
          {role === "admin" ? (
            <>
              <label
                htmlFor="attendance-class-id"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Kelas
              </label>
              <select
                id="attendance-class-id"
                className={inputClasses}
                value={selectedClassId ? String(selectedClassId) : ""}
                onChange={(event) =>
                  setSelectedClassId(
                    event.target.value ? Number(event.target.value) : null
                  )
                }
              >
                {classes.map((classRow) => (
                  <option key={classRow.id} value={classRow.id}>
                    {classRow.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <span className="mb-1 block text-sm font-semibold text-slate-700">
                Kelas
              </span>
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {selectedClass?.name ?? "\u2014"}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {STATUS_OPTIONS.map((option) => (
          <p
            key={option.value}
            className={`rounded-xl px-4 py-2.5 text-xs font-extrabold ${STATUS_CHIP_TONES[option.value]}`}
          >
            {option.label}:{" "}
            <span className="text-base font-extrabold">
              {counts[option.value]}
            </span>
          </p>
        ))}
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : classes.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada kelas terdaftar.
        </p>
      ) : roster.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada santri terdaftar di kelas ini.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Absensi per santri</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th scope="col" className="px-4 py-3">
                  Santri
                </th>
                <th scope="col" className="px-4 py-3">
                  Kelas
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {roster.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <td className="px-4 py-3 font-bold text-mint-900">
                    {enrollment.student_name}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {enrollment.class_code}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Status ${enrollment.student_name}`}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60"
                      value={activeDrafts[enrollment.id] ?? "hadir"}
                      disabled={draftsStale}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [enrollment.id]: event.target.value as AttendanceStatus,
                        }))
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {classes.length > 0 && roster.length > 0 ? (
        <div>
          <Button
            loading={saving}
            disabled={saving || draftsStale}
            onClick={handleSave}
          >
            Simpan Absensi
          </Button>
        </div>
      ) : null}
    </div>
  );
}
