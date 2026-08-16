"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { contentApi } from "@/lib/api/content";
import {
  smsApi,
  type AcademicYear,
  type Enrollment,
  type SmsStudent,
} from "@/lib/api/sms";
import type { AdminClass } from "@/lib/types/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const enrollmentFormSchema = z.object({
  student_id: z.coerce.number().int().positive("Pilih santri"),
  class_id: z.coerce.number().int().positive("Pilih kelas"),
  academic_year_id: z.coerce.number().int().positive("Pilih tahun ajaran"),
});

const yearFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama tahun ajaran wajib diisi")
    .max(20, "Nama tahun ajaran maksimal 20 karakter"),
});

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

const STATUS_LABELS: Record<Enrollment["status"], string> = {
  active: "Aktif",
  graduated: "Lulus",
  transferred: "Pindah",
};

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

export function EnrollmentsScreen() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<SmsStudent[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [yearSaving, setYearSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Enrollment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formValues, setFormValues] = useState({
    student_id: "",
    class_id: "",
    academic_year_id: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [yearName, setYearName] = useState("");
  const [yearError, setYearError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([
      smsApi.listEnrollments(),
      smsApi.listStudents(),
      contentApi.list<AdminClass>("classes"),
      smsApi.listAcademicYears(),
    ])
      .then(([enrollmentsRes, studentsRes, classesRes, yearsRes]) => {
        setEnrollments(enrollmentsRes.enrollments);
        setStudents(studentsRes.students);
        setClasses(classesRes.classes);
        setYears(yearsRes.academic_years);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function clearNotices() {
    setError(null);
    setSuccess(null);
    setYearError(null);
  }

  const activeYearId = years.find((year) => year.is_active)?.id;
  const yearValue =
    formValues.academic_year_id ||
    (activeYearId ? String(activeYearId) : "");

  function updateField(name: keyof typeof formValues, value: string) {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleRegister() {
    const parsed = enrollmentFormSchema.safeParse(formValues);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setSaving(true);
    clearNotices();
    try {
      await smsApi.createEnrollment(parsed.data);
      setSuccess("Pendaftaran berhasil");
      setFormValues((prev) => ({ ...prev, student_id: "", class_id: "" }));
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateYear() {
    const parsed = yearFormSchema.safeParse({ name: yearName });
    if (!parsed.success) {
      setYearError(parsed.error.issues[0]?.message ?? "Nama tidak valid");
      return;
    }
    setYearSaving(true);
    clearNotices();
    try {
      const created = await smsApi.createAcademicYear({ name: parsed.data.name });
      setYearName("");
      setSuccess("Tahun ajaran ditambahkan");
      setFormValues((prev) => ({
        ...prev,
        academic_year_id: String(created.id),
      }));
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setYearSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    clearNotices();
    try {
      await smsApi.deleteEnrollment(pendingDelete.id);
      setSuccess("Pendaftaran dihapus");
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const classById = new Map(classes.map((classRow) => [classRow.id, classRow]));
  const yearById = new Map(years.map((year) => [year.id, year]));

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

      {success ? (
        <p
          role="alert"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          {success}
        </p>
      ) : null}

      <form
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleRegister();
        }}
      >
        <h3 className="text-base font-bold text-mint-900">
          Daftarkan ke Kelas
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="enrollment-student-id"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Santri <span className="text-rose-600">*</span>
            </label>
            <select
              id="enrollment-student-id"
              className={inputClasses}
              value={formValues.student_id}
              onChange={(event) => updateField("student_id", event.target.value)}
            >
              <option value="">Pilih\u2026</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
            {fieldErrors.student_id ? (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {fieldErrors.student_id}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="enrollment-class-id"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Kelas <span className="text-rose-600">*</span>
            </label>
            <select
              id="enrollment-class-id"
              className={inputClasses}
              value={formValues.class_id}
              onChange={(event) => updateField("class_id", event.target.value)}
            >
              <option value="">Pilih\u2026</option>
              {classes.map((classRow) => (
                <option key={classRow.id} value={classRow.id}>
                  {classRow.name}
                </option>
              ))}
            </select>
            {fieldErrors.class_id ? (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {fieldErrors.class_id}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="enrollment-academic-year-id"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Tahun Ajaran <span className="text-rose-600">*</span>
            </label>
            <select
              id="enrollment-academic-year-id"
              className={inputClasses}
              value={yearValue}
              onChange={(event) =>
                updateField("academic_year_id", event.target.value)
              }
            >
              <option value="">Pilih\u2026</option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                  {year.is_active ? " \u00b7 Aktif" : ""}
                </option>
              ))}
            </select>
            {fieldErrors.academic_year_id ? (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {fieldErrors.academic_year_id}
              </p>
            ) : null}
          </div>
          <div className="flex items-end justify-end sm:col-span-2">
            <Button type="submit" size="sm" loading={saving}>
              Daftarkan
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label
            htmlFor="enrollment-new-year"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Tahun Ajaran Baru
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="enrollment-new-year"
              type="text"
              className={inputClasses}
              placeholder="contoh: 2027/2028"
              value={yearName}
              maxLength={20}
              onChange={(event) => {
                setYearName(event.target.value);
                if (yearError) setYearError(null);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              loading={yearSaving}
              onClick={() => void handleCreateYear()}
            >
              Tambah Tahun Ajaran
            </Button>
          </div>
          {yearError ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {yearError}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">
            Tahun ajaran baru berstatus tidak aktif sampai diaktifkan di
            pengelolaan tahun ajaran.
          </p>
        </div>
      </form>

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : enrollments.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada pendaftaran kelas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">Santri</th>
                <th className="px-3 py-2.5 font-semibold">Kelas</th>
                <th className="px-3 py-2.5 font-semibold">Tahun Ajaran</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => {
                const classRow = classById.get(enrollment.class_id);
                const year = yearById.get(enrollment.academic_year_id);
                return (
                  <tr
                    key={enrollment.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-2.5 font-semibold text-mint-900">
                      {enrollment.student_name}
                    </td>
                    <td className="px-3 py-2.5">
                      {classRow?.name ?? enrollment.class_code}
                    </td>
                    <td className="px-3 py-2.5">{year?.name ?? "\u2014"}</td>
                    <td className="px-3 py-2.5">
                      <Badge
                        tone={
                          enrollment.status === "active" ? "emerald" : "neutral"
                        }
                      >
                        {STATUS_LABELS[enrollment.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingDelete(enrollment)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete ? (
        <ConfirmDialog
          enrollment={pendingDelete}
          deleting={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      ) : null}
    </div>
  );
}

function ConfirmDialog({
  enrollment,
  deleting,
  onCancel,
  onConfirm,
}: {
  enrollment: Enrollment;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [deleting, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Konfirmasi: Hapus pendaftaran ${enrollment.student_name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <h2 className="text-base font-bold text-slate-900">
          Hapus pendaftaran {enrollment.student_name}?
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Pendaftaran {enrollment.student_name} ke kelas pada tahun ajaran
          tersebut akan dihapus beserta catatan absensinya. Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button size="sm" loading={deleting} onClick={onConfirm}>
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
}
