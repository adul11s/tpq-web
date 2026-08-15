import type { ContentStatus } from "@/lib/types/admin";

const STATUS_CONFIG: Record<
  ContentStatus,
  { label: string; badge: string; dot: string }
> = {
  draft: { label: "Draft", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  published: { label: "Publik", badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  archived: { label: "Arsip", badge: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
