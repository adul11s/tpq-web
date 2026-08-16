"use client";

import { useCallback, useEffect, useState } from "react";
import {
  smsApi,
  type AcademicYear,
  type AdabCriterion,
  type AdabRating,
  type Enrollment,
  type RaporDocument,
  type RaporPeriod,
  type Semester,
} from "@/lib/api/sms";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const SEMESTER_LABELS: Record<Semester, string> = {
  ganjil: "Ganjil",
  genap: "Genap",
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return iso.slice(0, 10).split("-").reverse().join("/");
}

const labelClasses =
  "mb-1 block text-sm font-semibold text-slate-700";

export function RaporBuilder() {
  const [periods, setPeriods] = useState<RaporPeriod[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [criteria, setCriteria] = useState<AdabCriterion[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [ratings, setRatings] = useState<AdabRating[]>([]);
  const [documents, setDocuments] = useState<RaporDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const [createYearId, setCreateYearId] = useState<string | null>(null);
  const [createSemester, setCreateSemester] = useState<Semester>("ganjil");
  const [creating, setCreating] = useState(false);

  const [pendingLock, setPendingLock] = useState<RaporPeriod | null>(null);
  const [toggling, setToggling] = useState(false);

  const [adabValues, setAdabValues] = useState<Record<string, number>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [narrativeDrafts, setNarrativeDrafts] = useState<Record<string, string>>({});
  const [savingAdab, setSavingAdab] = useState(false);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      smsApi.listRaporPeriods(),
      smsApi.listAcademicYears(),
      smsApi.listAdabCriteria(),
      smsApi.listEnrollments(),
      smsApi.listAdabRatings(),
      smsApi.listRaporDocuments(),
    ])
      .then(([periodsRes, yearsRes, criteriaRes, enrollmentsRes, ratingsRes, docsRes]) => {
        setPeriods(periodsRes.periods);
        setYears(yearsRes.academic_years);
        setCriteria(criteriaRes.criteria);
        setEnrollments(enrollmentsRes.enrollments);
        setRatings(ratingsRes.ratings);
        setDocuments(docsRes.documents);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createYearIdResolved =
    createYearId ??
    (years.find((year) => year.is_active)?.id ?? years[0]?.id) ??
    null;

  const selectedPeriodIdResolved = selectedPeriodId ?? periods[0]?.id ?? null;

  const selectedPeriod =
    periods.find((period) => period.id === selectedPeriodIdResolved) ?? null;

  const roster = selectedPeriod
    ? enrollments.filter(
        (enrollment) =>
          enrollment.status === "active" &&
          enrollment.academic_year_id === selectedPeriod.academic_year_id
      )
    : [];

  const selectedStudentIdResolved =
    selectedStudentId ??
    roster[0]?.student_id ??
    null;

  const selectedStudent =
    roster.find(
      (enrollment) => enrollment.student_id === selectedStudentIdResolved
    ) ?? null;
  const isPaud = selectedStudent?.class_code?.toUpperCase() === "PAUD";
  const locked = selectedPeriod?.status === "locked";

  const serverAdabValues: Record<number, number> = {};
  if (selectedStudentIdResolved !== null && selectedPeriodIdResolved !== null) {
    for (const rating of ratings) {
      if (
        rating.student_id === selectedStudentIdResolved &&
        rating.rapor_period_id === selectedPeriodIdResolved
      ) {
        serverAdabValues[rating.criterion_id] = rating.score;
      }
    }
  }

  const adabOverrideKey = (criterionId: number): string =>
    `${selectedStudentIdResolved}:${selectedPeriodIdResolved}:${criterionId}`;

  const textKey = `${selectedStudentIdResolved}:${selectedPeriodIdResolved}`;
  const comment = commentDrafts[textKey] ?? "";
  const narrative = narrativeDrafts[textKey] ?? "";

  const adabValueFor = (criterionId: number): string => {
    const override = adabValues[adabOverrideKey(criterionId)];
    if (override !== undefined) return String(override);
    const server = serverAdabValues[criterionId];
    return server !== undefined ? String(server) : "";
  };

  function clearNotices() {
    setError(null);
    setSuccess(null);
  }

  function handleCreatePeriod() {
    if (createYearIdResolved === null) return;
    setCreating(true);
    clearNotices();
    smsApi
      .createRaporPeriod({
        academic_year_id: Number(createYearIdResolved),
        semester: createSemester,
      })
      .then(() => {
        setSuccess("Periode rapor dibuat");
        load();
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setCreating(false));
  }

  function handleConfirmLock() {
    if (!pendingLock) return;
    setToggling(true);
    clearNotices();
    smsApi
      .lockPeriod(pendingLock.id)
      .then(() => {
        setSuccess("Periode rapor dikunci");
        setPendingLock(null);
        load();
      })
      .catch((err: unknown) => {
        setError(errorMessage(err));
        setPendingLock(null);
      })
      .finally(() => setToggling(false));
  }

  function handleUnlock(period: RaporPeriod) {
    setToggling(true);
    clearNotices();
    smsApi
      .unlockPeriod(period.id)
      .then(() => {
        setSuccess("Periode rapor dibuka kembali");
        load();
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setToggling(false));
  }

  function handleAdabChange(criterionId: number, rawValue: string) {
    if (!selectedStudent || !selectedPeriod) return;
    const next: Record<string, number> = { ...adabValues };
    const key = adabOverrideKey(criterionId);
    if (rawValue === "" || Number(rawValue) === 0) {
      delete next[key];
    } else {
      next[key] = Number(rawValue);
    }
    const entries: Array<{ criterion_id: number; scale: number }> = [];
    for (const criterion of criteria) {
      const key = adabOverrideKey(criterion.id);
      const effective =
        next[key] ??
        serverAdabValues[criterion.id] ??
        0;
      if (effective > 0) {
        entries.push({ criterion_id: criterion.id, scale: effective });
      }
    }
    setAdabValues(next);
    setSavingAdab(true);
    clearNotices();
    smsApi
      .updateAdabRatings({
        student_id: selectedStudent.student_id,
        rapor_period_id: selectedPeriod.id,
        ratings: entries,
      })
      .then(() =>
        setSuccess(
          entries.length > 0
            ? `Nilai adab disimpan (${entries.length} kriteria)`
            : "Nilai adab dikosongkan"
        )
      )
      .catch((err: unknown) => {
        setError(errorMessage(err));
        handleCancelEffect(criterionId);
      })
      .finally(() => setSavingAdab(false));
  }

  function handleCancelEffect(criterionId: number) {
    setAdabValues((prev) => {
      const next = { ...prev };
      const key = adabOverrideKey(criterionId);
      const score = serverAdabValues[criterionId];
      if (score) {
        next[key] = score;
      } else {
        delete next[key];
      }
      return next;
    });
  }

  function handleGenerate() {
    if (!selectedStudent || !selectedPeriod) return;
    setGenerating(true);
    clearNotices();
    smsApi
      .generateRapor({
        student_id: selectedStudent.student_id,
        rapor_period_id: selectedPeriod.id,
        teacher_comment: comment,
        ...(narrative ? { narrative } : {}),
      })
      .then(() => {
        setSuccess("PDF rapor dibuat");
        return smsApi.listRaporDocuments();
      })
      .then((docsRes) => setDocuments(docsRes.documents))
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setGenerating(false));
  }

  function handleDownload(document: RaporDocument) {
    clearNotices();
    smsApi
      .raporDocumentDownload(document.id)
      .then(({ download_url }) => window.open(download_url, "_blank"))
      .catch((err: unknown) => setError(errorMessage(err)));
  }

  const periodLabel = (period: RaporPeriod) =>
    `${period.academic_year} \u00b7 ${SEMESTER_LABELS[period.semester]}`;

  const visibleDocuments =
    selectedPeriodIdResolved !== null
      ? documents.filter(
          (document) => document.rapor_period_id === selectedPeriodIdResolved
        )
      : documents;

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
          handleCreatePeriod();
        }}
      >
        <h3 className="text-base font-bold text-mint-900">Buat Periode Rapor</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rapor-year" className={labelClasses}>
              Tahun Ajaran
            </label>
            <select
              id="rapor-year"
              className={inputClasses}
              value={createYearIdResolved ?? ""}
              onChange={(event) => setCreateYearId(event.target.value)}
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                  {year.is_active ? " \u00b7 Aktif" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rapor-semester" className={labelClasses}>
              Semester
            </label>
            <select
              id="rapor-semester"
              className={inputClasses}
              value={createSemester}
              onChange={(event) =>
                setCreateSemester(event.target.value as Semester)
              }
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" size="sm" loading={creating}>
            Buat Periode
          </Button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : periods.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada periode rapor.
        </p>
      ) : (
        <ul className="space-y-2">
          {periods.map((period) => (
            <li
              key={period.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-mint-900">
                  {periodLabel(period)}
                </span>
                <Badge tone={period.status === "locked" ? "neutral" : "emerald"}>
                  {period.status === "locked" ? "Terkunci" : "Terbuka"}
                </Badge>
              </div>
              {period.status === "locked" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={toggling}
                  onClick={() => handleUnlock(period)}
                >
                  Buka
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={toggling}
                  onClick={() => setPendingLock(period)}
                >
                  Kunci
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-bold text-mint-900">Kunci &amp; Penilaian</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rapor-period" className={labelClasses}>
              Periode
            </label>
            <select
              id="rapor-period"
              className={inputClasses}
              value={selectedPeriodIdResolved ? String(selectedPeriodIdResolved) : ""}
              onChange={(event) =>
                setSelectedPeriodId(event.target.value ? Number(event.target.value) : null)
              }
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {periodLabel(period)} ({period.status === "locked" ? "Terkunci" : "Terbuka"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rapor-student" className={labelClasses}>
              Santri
            </label>
            <select
              id="rapor-student"
              className={inputClasses}
              value={
                selectedStudentIdResolved
                  ? String(selectedStudentIdResolved)
                  : ""
              }
              onChange={(event) =>
                setSelectedStudentId(
                  event.target.value ? Number(event.target.value) : null
                )
              }
            >
              {roster.map((enrollment) => (
                <option key={enrollment.id} value={enrollment.student_id}>
                  {enrollment.student_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedPeriod && selectedStudent ? (
          <div className="mt-5 space-y-4">
            {locked ? (
              <p
                role="status"
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700"
              >
                Periode ini terkunci \u2014 nilai adab dan narasi tidak dapat diubah.
              </p>
            ) : null}

            {isPaud ? (
              <div>
                <label htmlFor="rapor-narrative" className={labelClasses}>
                  Narasi Perkembangan
                </label>
                <textarea
                  id="rapor-narrative"
                  className={`${inputClasses} min-h-24 resize-y`}
                  placeholder="Cerita perkembangan santri pada periode ini\u2026"
                  value={narrative}
                  disabled={locked}
                  onChange={(event) =>
                    setNarrativeDrafts((prev) => ({
                      ...prev,
                      [textKey]: event.target.value,
                    }))
                  }
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {criteria.map((criterion) => (
                  <div key={criterion.id}>
                    <label
                      htmlFor={`rapor-adab-${criterion.id}`}
                      className={labelClasses}
                    >
                      {criterion.name}
                    </label>
                    <select
                      id={`rapor-adab-${criterion.id}`}
                      className={inputClasses}
                      value={adabValueFor(criterion.id)}
                      disabled={locked || savingAdab}
                      onChange={(event) =>
                        handleAdabChange(criterion.id, event.target.value)
                      }
                    >
                      <option value="">Pilih\u2026</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label htmlFor="rapor-comment" className={labelClasses}>
                Catatan Guru
              </label>
              <textarea
                id="rapor-comment"
                className={`${inputClasses} min-h-20 resize-y`}
                placeholder="Catatan bebas untuk rapor santri\u2026"
                value={comment}
                onChange={(event) =>
                  setCommentDrafts((prev) => ({
                    ...prev,
                    [textKey]: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                loading={generating}
                onClick={handleGenerate}
              >
                Generate PDF
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm font-semibold text-slate-500">
            Pilih periode dan santri untuk penilaian rapor.
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-bold text-mint-900">Dokumen Rapor</h3>
        {visibleDocuments.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Belum ada dokumen rapor untuk periode ini.
          </p>
        ) : (
          <table className="mt-3 w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">Santri</th>
                <th className="px-3 py-2.5 font-semibold">Semester</th>
                <th className="px-3 py-2.5 font-semibold">Ukuran</th>
                <th className="px-3 py-2.5 font-semibold">Tanggal</th>
                <th className="px-3 py-2.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleDocuments.map((document) => (
                <tr key={document.id} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 font-semibold text-mint-900">
                    {document.student_name}
                  </td>
                  <td className="px-3 py-2.5">
                    {SEMESTER_LABELS[document.semester]}
                  </td>
                  <td className="px-3 py-2.5">{formatSize(document.file_size)}</td>
                  <td className="px-3 py-2.5">
                    {formatDate(document.finalized_at)}
                  </td>
                  <td className="px-3 py-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      Unduh
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pendingLock ? (
        <ConfirmDialog
          periodLabel={periodLabel(pendingLock)}
          busy={toggling}
          onCancel={() => setPendingLock(null)}
          onConfirm={() => handleConfirmLock()}
        />
      ) : null}
    </div>
  );
}

function ConfirmDialog({
  periodLabel,
  busy,
  onCancel,
  onConfirm,
}: {
  periodLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Konfirmasi: Kunci periode ${periodLabel}`}
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
          Kunci periode {periodLabel}?
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Periode yang terkunci memfinalisasi nilai adab dan narasi santri.
          Generate PDF rapor hanya berfungsi pada periode terkunci.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button size="sm" loading={busy} onClick={onConfirm}>
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
}