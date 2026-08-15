"use client";

import Link from "next/link";
import { ENTITY_CONFIG } from "@/lib/admin/entities";
import { useSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default function KontenIndexPage() {
  const { user } = useSession();

  if (!user) return null;

  const visible = Object.entries(ENTITY_CONFIG).filter(([, config]) =>
    config.roles.includes(user.role)
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-mint-900">Konten</h2>
      <p className="mt-1 text-sm text-slate-600">
        Pilih jenis konten yang ingin dikelola.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(([key, config]) => (
          <Link
            key={key}
            href={`/admin/konten/${key}`}
            className="group flex flex-col gap-1 rounded-2xl border border-mint-200 bg-white p-5 shadow-sm transition-colors hover:border-mint-400 hover:bg-mint-50"
          >
            <span className="text-base font-bold text-mint-900">
              {config.label}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {config.description}
            </span>
            <span className="mt-2 text-sm font-bold text-mint-600 transition-colors group-hover:text-mint-700">
              Buka &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
