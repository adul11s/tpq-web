"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { contentApi } from "@/lib/api/content";
import {
  smsApi,
  type AcademicYear,
  type Guardianship,
  type SmsStudent,
} from "@/lib/api/sms";
import type { AdminClass } from "@/lib/types/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GuardianshipsPanel } from "./GuardianshipsPanel";

const studentFormSchema = z.object({
  nis: z
    .string()
    .trim()
    .max(30, "NIS maksimal 30 karakter")
    .optional(),
  full_name: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(150, "Nama lengkap maksimal 150 karakter"),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD")
    .optional(),
  class_id: z.coerce.number().int().positive().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

interface StudentFormProps {
  classes: AdminClass[];
  editing: SmsStudent | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (values: StudentFormValues) => void;
}

function StudentForm({
  classes,
  editing,
  saving,
  onCancel,
  onSave,
}: StudentFormProps) {
  const [values, setValues] = useState(() => ({
    nis: editing?.nis ?? "",
    full_name: editing?.full_name ?? "",
    birth_date: editing?.birth_date ?? "",
    class_id: "",
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update(name: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleSubmit() {
    const parsed = studentFormSchema.safeParse({
      nis: values.nis.trim() || undefined,
      full_name: values.full_name.trim(),
      birth_date: values.birth_date || undefined,
      class_id: values.class_id || undefined,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    onSave(parsed.data);
  }

  return (
    <form
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <h3 className="text-base font-bold text-mint-900">
        {editing ? `Edit Santri — ${editing.full_name}` : "Tambah Santri"}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="student-nis"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            NIS
          </label>
          <input
            id="student-nis"
            type="text"
            className={inputClasses}
            value={values.nis}
            maxLength={30}
            placeholder="TPQ-2026-0001"
            onChange={(event) => update("nis", event.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">
            Kosongkan untuk otomatis diisi TPQ-&lt;tahun&gt;-&lt;no&gt;.
          </p>
          {fieldErrors.nis ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {fieldErrors.nis}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="student-full-name"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Nama Lengkap <span className="text-rose-600">*</span>
          </label>
          <input
            id="student-full-name"
            type="text"
            className={inputClasses}
            value={values.full_name}
            maxLength={150}
            onChange={(event) => update("full_name", event.target.value)}
          />
          {fieldErrors.full_name ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {fieldErrors.full_name}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="student-birth-date"
            className="mb-1 block text-sm font-semibold text-slate-700"
          >
            Tanggal Lahir
          </label>
          <input
            id="student-birth-date"
            type="date"
            className={inputClasses}
            value={values.birth_date}
            onChange={(event) => update("birth_date", event.target.value)}
          />
          {fieldErrors.birth_date ? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              {fieldErrors.birth_date}
            </p>
          ) : null}
        </div>
        {editing ? (
          <div>
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              Kelas
            </span>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              {editing.class ?? "\u2014"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Perpindahan kelas dikelola lewat Pendaftaran Kelas.
            </p>
          </div>
        ) : (
          <div>
            <label
              htmlFor="student-class-id"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Kelas
            </label>
            <select
              id="student-class-id"
              className={inputClasses}
              value={values.class_id}
              onChange={(event) => update("class_id", event.target.value)}
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
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={saving}
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button type="submit" size="sm" loading={saving}>
          {editing ? "Simpan Perubahan" : "Simpan Santri"}
        </Button>
      </div>
    </form>
  );
}

export function StudentsScreen() {
  const [students, setStudents] = useState<SmsStudent[]>([]);
  const [guardianships, setGuardianships] = useState<Guardianship[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SmsStudent | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SmsStudent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [panelFor, setPanelFor] = useState<SmsStudent | null>(null);

  const load = useCallback(() => {
    Promise.all([
      smsApi.listStudents(),
      smsApi.listGuardianships(),
      contentApi.list<AdminClass>("classes"),
    ])
      .then(([studentsRes, guardianshipsRes, classesRes]) => {
        setStudents(studentsRes.students);
        setGuardianships(guardianshipsRes.guardianships);
        setClasses(classesRes.classes);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ensureYears = useCallback(async (): Promise<AcademicYear[]> => {
    if (years.length > 0) return years;
    const loaded = await smsApi.listAcademicYears();
    setYears(loaded.academic_years);
    return loaded.academic_years;
  }, [years]);

  function openCreateForm() {
    setEditing(null);
    setFormOpen(true);
    setError(null);
  }

  function openEditForm(student: SmsStudent) {
    setEditing(student);
    setFormOpen(true);
    setError(null);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleSave(values: StudentFormValues) {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await smsApi.updateStudent(editing.id, {
          nis: values.nis ?? null,
          full_name: values.full_name,
          birth_date: values.birth_date ?? null,
        });
        setSuccess("Data santri diperbarui");
      } else {
        const created = await smsApi.createStudent({
          ...(values.nis ? { nis: values.nis } : {}),
          full_name: values.full_name,
          ...(values.birth_date ? { birth_date: values.birth_date } : {}),
        });
        if (values.class_id) {
          const activeYear = (await ensureYears()).find(
            (year) => year.is_active
          );
          if (activeYear) {
            await smsApi.createEnrollment({
              student_id: created.id,
              class_id: values.class_id,
              academic_year_id: activeYear.id,
            });
            setSuccess("Santri disimpan dan didaftarkan ke kelas");
          } else {
            setSuccess(
              "Santri disimpan (belum didaftarkan ke kelas \u2014 belum ada tahun ajaran aktif)"
            );
          }
        } else {
          setSuccess("Santri disimpan");
        }
      }
      closeForm();
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await smsApi.deleteStudent(pendingDelete.id);
      setSuccess("Santri dihapus");
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const linksFor = (studentId: number) =>
    guardianships.filter(
      (guardianship) => guardianship.student_id === studentId
    );

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

      <div className="flex justify-end">
        <Button size="sm" onClick={openCreateForm}>
          Tambah Santri
        </Button>
      </div>

      {formOpen ? (
        <StudentForm
          classes={classes}
          editing={editing}
          saving={saving}
          onCancel={closeForm}
          onSave={(values) => void handleSave(values)}
        />
      ) : null}

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : students.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada santri terdaftar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">NIS</th>
                <th className="px-3 py-2.5 font-semibold">Nama</th>
                <th className="px-3 py-2.5 font-semibold">Kelas</th>
                <th className="px-3 py-2.5 font-semibold">Orang Tua</th>
                <th className="px-3 py-2.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const links = linksFor(student.id);
                return (
                  <tr key={student.id} className="border-b border-slate-100">
                    <td className="px-3 py-2.5 font-semibold text-mint-900">
                      {student.nis ?? "\u2014"}
                    </td>
                    <td className="px-3 py-2.5">{student.full_name}</td>
                    <td className="px-3 py-2.5">{student.class ?? "\u2014"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {links.length > 0 ? (
                          links.map((link) => (
                            <Badge key={link.id} tone="sky">
                              {link.parent_email}
                            </Badge>
                          ))
                        ) : (
                          <Badge>Belum ditautkan</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPanelFor(student)}
                        >
                          Tautkan Ortu
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(student)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingDelete(student)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {panelFor ? (
        <GuardianshipsPanel
          student={panelFor}
          guardianships={guardianships}
          onChanged={load}
          onClose={() => setPanelFor(null)}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          student={pendingDelete}
          deleting={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      ) : null}
    </div>
  );
}

function ConfirmDialog({
  student,
  deleting,
  onCancel,
  onConfirm,
}: {
  student: SmsStudent;
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
      aria-label={`Konfirmasi: Hapus santri ${student.full_name}`}
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
          Hapus santri {student.full_name}?
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Data santri beserta tautan orang tua dan pendaftaran kelasnya akan
          dihapus. Tindakan ini tidak dapat dibatalkan.
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
