import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { localizedHref, type Lang } from "@/lib/lang";
import type { ClassSummary } from "@/lib/types/class";

interface ClassCardProps {
  classItem: ClassSummary;
  lang: Lang;
}

const cardStyles: Record<string, string> = {
  PAUD: "from-emerald-500 to-teal-600",
  TK: "from-sky-500 to-indigo-600",
  TPA: "from-violet-500 to-purple-600",
};

export function ClassCard({ classItem, lang }: ClassCardProps) {
  const gradient = cardStyles[classItem.code] ?? cardStyles.PAUD;
  const href = localizedHref(lang, `/kelas/${classItem.code.toLowerCase()}`);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`flex aspect-[3/2] items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        <span className="text-4xl font-extrabold tracking-wider text-white">
          {classItem.code}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">
          {classItem.name}
        </h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {classItem.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge tone="emerald">
            {classItem.ageMin}–{classItem.ageMax}{" "}
            {lang === "en" ? "years" : "tahun"}
          </Badge>
          {classItem.hours ? <Badge>{classItem.hours}</Badge> : null}
        </div>
      </div>
    </Link>
  );
}
