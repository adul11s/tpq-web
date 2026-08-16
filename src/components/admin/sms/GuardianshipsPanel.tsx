"use client";

import { useEffect, useState } from "react";
import { smsApi, type Guardianship, type SmsStudent } from "@/lib/api/sms";
import { userApi } from "@/lib/api/users";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ParentAccount {
  id: number;
  email: string;
  full_name: string;
}

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60";

function errorMessage(error: unknown): string {
  const apiError = error as { message?: string };
  return apiError.message ?? "Terjadi kesalahan";
}

export function GuardianshipsPanel({
  student,
  guardianships,
  onChanged,
  onClose,
}: {
  student: SmsStudent;
  guardianships: Guardianship[];
  onChanged: () => void;
  onClose: () => void;
}) {
  const links = guardianships.filter(
    (guardianship) => guardianship.student_id === student.id
  );
  const [parents, setParents] = useState<ParentAccount[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [linking, setLinking] = useState<number | null>(null);
  const [unlinking, setUnlinking] = useState<number | null>(null);

  useEffect(() => {
    userApi
      .list()
      .then((result) =>
        setParents(
          result.users
            .filter((user) => (user as { role?: string }).role === "parent")
            .map((user) => ({
              id: user.id,
              email: user.email,
              full_name: user.full_name,
            }))
        )
      )
      .catch((err: unknown) => setError(errorMessage(err)));
  }, []);

  const search = query.trim().toLowerCase();
  const results = search
    ? parents
        .filter((parent) => parent.email.toLowerCase().includes(search))
        .slice(0, 6)
    : [];

  async function handleLink(userId: number) {
    setError(null);
    setLinking(userId);
    try {
      await smsApi.createGuardianship({
        user_id: userId,
        student_id: student.id,
      });
      setQuery("");
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLinking(null);
    }
  }

  async function handleUnlink(id: number) {
    setError(null);
    setUnlinking(id);
    try {
      await smsApi.deleteGuardianship(id);
      onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUnlinking(null);
    }
  }

  return (
    <section
      aria-label={`Tautkan orang tua untuk ${student.full_name}`}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-mint-900">
            Tautkan Orang Tua — {student.full_name}
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            Hubungkan akun orang tua (role parent) ke santri ini.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Tutup
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      ) : null}

      {links.length > 0 ? (
        <ul className="mt-4 divide-y divide-slate-100">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {link.parent_email}
                </p>
                {link.relation ? (
                  <Badge tone="sky" className="mt-1">
                    {link.relation}
                  </Badge>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={unlinking === link.id}
                onClick={() => void handleUnlink(link.id)}
              >
                Lepas
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Belum ada orang tua tertaut untuk santri ini.
        </p>
      )}

      <div className="mt-4">
        <label
          htmlFor={`guardian-search-${student.id}`}
          className="mb-1 block text-sm font-semibold text-slate-700"
        >
          Cari email orang tua
        </label>
        <input
          id={`guardian-search-${student.id}`}
          type="search"
          className={inputClasses}
          placeholder="contoh: ibu@example.com"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {results.length > 0 ? (
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50">
          {results.map((parent) => (
            <li
              key={parent.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {parent.email}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {parent.full_name}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={linking === parent.id}
                onClick={() => void handleLink(parent.id)}
              >
                Tautkan
              </Button>
            </li>
          ))}
        </ul>
      ) : search ? (
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Tidak ada akun parent dengan email tersebut.
        </p>
      ) : null}
    </section>
  );
}
