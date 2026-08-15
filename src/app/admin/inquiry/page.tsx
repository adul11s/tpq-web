"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { inquiryAdminApi } from "@/lib/api/inquiries";
import { fetchClasses } from "@/lib/data/classes";
import { waLink } from "@/lib/wa";
import { useSession } from "@/lib/admin/session";
import { Button } from "@/components/ui/Button";
import { CsvLink } from "@/components/admin/CsvLink";
import type { AdminInquiry, InquiryStatus } from "@/lib/types/admin";
import type { ClassSummary } from "@/lib/types/class";

export const dynamic = "force-dynamic";

const PIPELINE: InquiryStatus[] = [
  "new",
  "contacted",
  "visited",
  "enrolled",
  "closed",
];

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  visited: "Visited",
  enrolled: "Enrolled",
  closed: "Closed",
};

const HOUR_24_MS = 24 * 60 * 60 * 1000;

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

function isOverdue(row: AdminInquiry): boolean {
  if (row.status !== "new") return false;
  const created = Date.parse(row.created_at);
  return Number.isFinite(created) && Date.now() - created > HOUR_24_MS;
}

function waHref(row: AdminInquiry): string | null {
  const number = row.whatsapp ?? row.phone;
  if (!number) return null;
  const parts = ["Assalamu'alaikum, saya dari TPQ Qur'ani."];
  if (row.child_age) parts.push(`Usia anak: ${row.child_age}.`);
  if (row.message) parts.push(`Pertanyaan: "${row.message}"`);
  return waLink(number, parts.join(" "));
}

export default function InquiryPage() {
  const { user } = useSession();
  const [filter, setFilter] = useState<InquiryStatus>("new");
  const [rows, setRows] = useState<AdminInquiry[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    inquiryAdminApi
      .list()
      .then((result) => setRows(result.inquiries))
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
    fetchClasses()
      .then(setClasses)
      .catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const tally: Record<InquiryStatus, number> = {
      new: 0,
      contacted: 0,
      visited: 0,
      enrolled: 0,
      closed: 0,
    };
    for (const row of rows) tally[row.status] += 1;
    return tally;
  }, [rows]);

  const visibleRows = useMemo(
    () => rows.filter((row) => row.status === filter),
    [rows, filter]
  );

  const classById = useMemo(
    () => new Map(classes.map((cls) => [cls.id, cls])),
    [classes]
  );

  function classLabel(programClassId: number | null): string {
    if (programClassId === null) return "\u2014";
    return classById.get(programClassId)?.code ?? String(programClassId);
  }

  async function handleStatusChange(row: AdminInquiry, status: InquiryStatus) {
    if (status === row.status) return;
    setSavingId(row.id);
    setError(null);
    try {
      const result = await inquiryAdminApi.update(row.id, { status });
      setRows((prev) =>
        prev.map((item) => (item.id === result.inquiry.id ? result.inquiry : item))
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  async function handleNoteSave(row: AdminInquiry) {
    const note = (noteDrafts[row.id] ?? "").trim();
    setSavingId(row.id);
    setError(null);
    try {
      const result = await inquiryAdminApi.update(row.id, { admin_note: note });
      setRows((prev) =>
        prev.map((item) => (item.id === result.inquiry.id ? result.inquiry : item))
      );
      setNoteDrafts((prev) => ({
        ...prev,
        [row.id]: result.inquiry.admin_note ?? "",
      }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  const nameLabel = (row: AdminInquiry) => row.parent_name ?? `Inquiry #${row.id}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-mint-900">Kotak Masuk Inquiry</h2>
        {user?.role === "admin" ? (
          <CsvLink url={inquiryAdminApi.adminExportUrl()} fileName="inquiries.csv" />
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <div
        role="group"
        aria-label="Pipeline inquiry"
        className="mb-4 flex flex-wrap gap-2"
      >
        {PIPELINE.map((status) => {
          const active = filter === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(status)}
              className={
                active
                  ? "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-mint-600 px-4 py-2 text-sm font-bold text-white"
                  : "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-mint-200 bg-white px-4 py-2 text-sm font-semibold text-mint-700 transition-colors hover:bg-mint-50"
              }
            >
              {STATUS_LABELS[status]}{" "}
              <span
                className={
                  active
                    ? "rounded-full bg-white/25 px-2 py-0.5 text-xs"
                    : "rounded-full bg-mint-50 px-2 py-0.5 text-xs text-mint-600"
                }
              >
                {counts[status]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-slate-500">Memuat\u2026</p>
      ) : visibleRows.length === 0 ? (
        <p className="text-sm font-semibold text-slate-500">
          Belum ada inquiry berstatus {STATUS_LABELS[filter]}.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">Ortu</th>
                <th className="px-3 py-2.5 font-semibold">Usia Anak</th>
                <th className="px-3 py-2.5 font-semibold">Kelas</th>
                <th className="px-3 py-2.5 font-semibold">Pesan</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Catatan Admin</th>
                <th className="px-3 py-2.5 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const href = waHref(row);
                const saving = savingId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 align-top"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-mint-900">
                          {row.parent_name ?? "Dianonimkan"}
                        </span>
                        {isOverdue(row) ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            &gt; 24 jam
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500">
                        {row.phone ?? "\u2014"}
                      </p>
                      {row.whatsapp ? (
                        <p className="text-xs text-slate-500">
                          WA: {row.whatsapp}
                        </p>
                      ) : null}
                      {row.handled_by !== null ? (
                        <p
                          className="text-xs text-slate-500"
                          title={`Ditangani oleh pengguna #${row.handled_by}`}
                        >
                          Ditangani oleh: #{row.handled_by}
                        </p>
                      ) : null}
                      {row.status === "enrolled" ? (
                        <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                          Tandai &rarr; daftarkan di SMS (fase 2)
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      {row.child_age ?? "\u2014"}
                    </td>
                    <td className="px-3 py-2.5">
                      {classLabel(row.program_class_id)}
                    </td>
                    <td className="max-w-[240px] whitespace-pre-wrap break-words px-3 py-2.5 text-slate-700">
                      {row.message ?? "\u2014"}
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        aria-label={`Status ${nameLabel(row)}`}
                        value={row.status}
                        disabled={saving}
                        onChange={(event) =>
                          handleStatusChange(
                            row,
                            event.target.value as InquiryStatus
                          )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                      >
                        {PIPELINE.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col items-start gap-1.5">
                        <textarea
                          aria-label={`Catatan admin untuk ${nameLabel(row)}`}
                          rows={2}
                          value={noteDrafts[row.id] ?? row.admin_note ?? ""}
                          onChange={(event) =>
                            setNoteDrafts((prev) => ({
                              ...prev,
                              [row.id]: event.target.value,
                            }))
                          }
                          placeholder="Tulis ringkasan percakapan atau tindak lanjut\u2026"
                          className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          loading={saving}
                          onClick={() => handleNoteSave(row)}
                        >
                          Simpan Catatan untuk {nameLabel(row)}
                        </Button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                        >
                          Lanjut via WhatsApp
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
