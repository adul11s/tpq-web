"use client";

import type { EntityConfig } from "@/lib/admin/entities";
import type { ContentStatus, Role } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "./StatusBadge";

export interface EntityTableProps {
  entity: EntityConfig;
  rows: Record<string, unknown>[];
  role: Role;
  onEdit: (row: Record<string, unknown>) => void;
  onPublish?: (row: Record<string, unknown>) => void;
  onArchive?: (row: Record<string, unknown>) => void;
}

export function EntityTable({
  entity,
  rows,
  role,
  onEdit,
  onPublish,
  onArchive,
}: EntityTableProps) {
  const canPublish = role === "admin" && entity.publishable;
  const canArchive = role === "admin" && entity.archivable;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            {entity.listColumns.map((column) => (
              <th key={column.key} className="px-3 py-2.5 font-semibold">
                {column.label}
              </th>
            ))}
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-3 py-2.5 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const status = String(row.status ?? "draft") as ContentStatus;
            return (
              <tr key={String(row.id)} className="border-b border-slate-100">
                {entity.listColumns.map((column) => (
                  <td key={column.key} className="px-3 py-2.5">
                    {column.render
                      ? column.render(row)
                      : String(row[column.key] ?? "")}
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  <StatusBadge status={status} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </Button>
                    {canPublish && status === "draft" ? (
                      <Button size="sm" onClick={() => onPublish?.(row)}>
                        Terbitkan
                      </Button>
                    ) : null}
                    {canArchive && status === "published" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onArchive?.(row)}
                      >
                        Arsipkan
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
