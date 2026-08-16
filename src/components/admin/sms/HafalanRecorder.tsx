"use client";

import { useCallback, useEffect, useState } from "react";
import { contentApi } from "@/lib/api/content";
import {
  smsApi,
  type Enrollment,
  type FluencyLevel,
  type HafalanLevel,
  type HafalanRecord,
  type HafalanStatus,
  type HafalanTarget,
} from "@/lib/api/sms";
import type { AdminClass } from "@/lib/types/admin";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABELS: Record<HafalanStatus, string> = {
  belum: "Belum",
  sedang: "Sedang",
  tuntas: "Tuntas",
};

const STATUS_TONES: Record<HafalanStatus, "neutral" | "amber" | "emerald"> = {
  belum: "neutral",
  sedang: "amber",
  tuntas: "emerald",
};

const FLUENCY_LABELS: Record<FluencyLevel, string> = {
  lancar: "Lancar",
  kurang_lancar: "Kurang lancar",
};

const NEXT_STATUS: Record<HafalanStatus, HafalanStatus> = {
  belum: "sedang",
  sedang: "tuntas",
  tuntas: "belum",
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function levelFromCode(code: string): HafalanLevel | null {
  const level = code.toLowerCase();
  return level === "paud" || level === "tk" || level === "tpa" ? level : null;
}

export function HafalanRecorder({
  role = "admin",
}: {
  role?: "admin" | "teacher";
}) {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [records, setRecords] = useState<HafalanRecord[]>([]);
  const [targets, setTargets] = useState<HafalanTarget[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      smsApi.listEnrollments(),
      contentApi.list<AdminClass>("classes"),
      smsApi.listHafalanTargets(),
      smsApi.listHafalan(),
    ])
      .then(([enrollmentsRes, classesRes, targetsRes, recordsRes]) => {
        setEnrollments(enrollmentsRes.enrollments);
        setClasses(classesRes.classes);
        setTargets(targetsRes.targets);
        setRecords(recordsRes.records);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectedClass = classes.find(
    (classRow) => classRow.id === (selectedClassId ?? classes[0]?.id)
  );
  const effectiveClassId = selectedClass?.id;
  const roster = enrollments.filter(
    (enrollment) =>
      enrollment.class_id === effectiveClassId && enrollment.status === "active"
  );

  const level =
    (selectedClass ? levelFromCode(selectedClass.code) : null) ??
    (roster[0] ? levelFromCode(roster[0].class_code) : null);
  const gridTargets = level
    ? targets.filter((target) => target.level === level)
    : [];

  function recordFor(studentId: number, surahName: string) {
    return records.find(
      (record) =>
        record.student_id === studentId && record.surah_name === surahName
    );
  }

  function applyChange(
    studentId: number,
    studentName: string,
    surahName: string,
    status: HafalanStatus,
    fluency: FluencyLevel | null
  ) {
    const optimisticFluency =
      status === "tuntas"
        ? fluency ?? recordFor(studentId, surahName)?.fluency ?? "lancar"
        : null;
    setRecords((prev) => {
      const existing = prev.find(
        (record) =>
          record.student_id === studentId && record.surah_name === surahName
      );
      const next: HafalanRecord = {
        id: existing?.id ?? -1,
        student_id: studentId,
        student_name: existing?.student_name ?? studentName,
        surah_name: surahName,
        status,
        fluency: optimisticFluency,
        updated_by: existing?.updated_by ?? 0,
        updated_at: existing?.updated_at ?? new Date().toISOString(),
      };
      return existing
        ? prev.map((record) =>
            record.student_id === studentId && record.surah_name === surahName
              ? next
              : record
          )
        : [...prev, next];
    });
    smsApi
      .upsertHafalan({
        student_id: studentId,
        surah_name: surahName,
        status,
        ...(status === "tuntas" && fluency ? { fluency } : {}),
      })
      .then((result) => {
        setRecords((prev) =>
          prev.map((record) =>
            record.student_id === studentId && record.surah_name === surahName
              ? { ...record, id: result.id, status: result.status, fluency: result.fluency }
              : record
          )
        );
      })
      .catch((err: unknown) => {
        setError(errorMessage(err));
        load();
      });
  }

  function handleCellClick(enrollment: Enrollment, surahName: string) {
    const current = recordFor(enrollment.student_id, surahName)?.status ?? "belum";
    applyChange(
      enrollment.student_id,
      enrollment.student_name,
      surahName,
      NEXT_STATUS[current],
      null
    );
  }

  function handleFluencyToggle(
    enrollment: Enrollment,
    surahName: string,
    fluency: FluencyLevel
  ) {
    applyChange(
      enrollment.student_id,
      enrollment.student_name,
      surahName,
      "tuntas",
      fluency === "lancar" ? "kurang_lancar" : "lancar"
    );
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

      <div>
        {role === "admin" ? (
          <>
            <label
              htmlFor="hafalan-class-id"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Kelas
            </label>
            <select
              id="hafalan-class-id"
              className={inputClasses}
              value={selectedClassId ? String(selectedClassId) : ""}
              onChange={(event) =>
                setSelectedClassId(event.target.value ? Number(event.target.value) : null)
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

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : classes.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada kelas terdaftar.
        </p>
      ) : gridTargets.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada target hafalan untuk level kelas ini.
        </p>
      ) : roster.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada santri terdaftar di kelas ini.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2.5 font-semibold">
                  Santri
                </th>
                {gridTargets.map((target) => (
                  <th
                    key={target.surah_name}
                    className="px-3 py-2.5 text-center font-semibold"
                  >
                    {target.surah_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roster.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="border-b border-slate-100"
                >
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2.5 font-semibold text-mint-900">
                    {enrollment.student_name}
                  </td>
                  {gridTargets.map((target) => {
                    const record = recordFor(
                      enrollment.student_id,
                      target.surah_name
                    );
                    const status = record?.status ?? "belum";
                    const fluency = record?.fluency ?? "lancar";
                    return (
                      <td
                        key={target.surah_name}
                        className="px-3 py-2.5 text-center"
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`${target.surah_name} \u2014 ${enrollment.student_name}: ${STATUS_LABELS[status]}`}
                            title={
                              record && record.updated_by > 0
                                ? `Diperbarui oleh #${record.updated_by}`
                                : undefined
                            }
                            onClick={() =>
                              handleCellClick(enrollment, target.surah_name)
                            }
                          >
                            <Badge tone={STATUS_TONES[status]}>
                              {STATUS_LABELS[status]}
                            </Badge>
                          </button>
                          {status === "tuntas" ? (
                            <button
                              type="button"
                              aria-label={`${target.surah_name} \u2014 ${enrollment.student_name}: kelancaran ${FLUENCY_LABELS[fluency]}`}
                              className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                              onClick={() =>
                                handleFluencyToggle(
                                  enrollment,
                                  target.surah_name,
                                  fluency
                                )
                              }
                            >
                              {FLUENCY_LABELS[fluency]}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
