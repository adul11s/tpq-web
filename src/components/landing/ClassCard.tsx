import Link from "next/link";
import { localizedHref, type Lang } from "@/lib/lang";
import type { ClassSummary } from "@/lib/types/class";

interface ClassCardProps {
  classItem: ClassSummary;
  lang: Lang;
}

interface ClassTheme {
  gradient: string;
  chipText: string;
  archColor: string;
  tagTint: string;
  ageIcon: React.ReactNode;
  arch: React.ReactNode;
}

const ARCH_COLOR: Record<string, string> = {
  PAUD: "text-mint-700/80",
  TK: "text-gold-600/80",
  TPA: "text-violet-700/80",
};

const THEMES: Record<string, ClassTheme> = {
  PAUD: {
    gradient: "from-sky-100 to-mint-100",
    chipText: "text-sky-700",
    archColor: ARCH_COLOR.PAUD,
    tagTint: "bg-mint-50 text-mint-700",
    ageIcon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" />
        <circle cx="15.5" cy="10" r="4" />
        <circle cx="6" cy="15" r="3.2" />
      </svg>
    ),
    arch: (
      <svg className="h-auto w-full" viewBox="0 0 200 160" aria-hidden="true">
        <rect x="30" y="40" width="24" height="96" rx="10" fill="#f43f5e" />
        <rect x="62" y="40" width="24" height="96" rx="10" fill="#8b5cf6" />
        <rect x="94" y="40" width="24" height="96" rx="10" fill="#f59e0b" />
        <rect x="126" y="40" width="24" height="96" rx="10" fill="#10b981" />
        <rect x="158" y="40" width="24" height="96" rx="10" fill="#0ea5e9" />
        <path d="M30 40 Q42 20 54 40 Z" fill="#fda4af" />
        <path d="M62 40 Q74 20 86 40 Z" fill="#c4b5fd" />
        <path d="M94 40 Q106 20 118 40 Z" fill="#fcd34d" />
        <path d="M126 40 Q138 20 150 40 Z" fill="#6ee7b7" />
        <path d="M158 40 Q170 20 182 40 Z" fill="#7dd3fc" />
      </svg>
    ),
  },
  TK: {
    gradient: "from-gold-100 to-mint-100",
    chipText: "text-gold-700",
    archColor: ARCH_COLOR.TK,
    tagTint: "bg-gold-50 text-gold-700",
    ageIcon: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8M8 10h8" strokeLinecap="round" />
      </svg>
    ),
    arch: (
      <svg className="h-auto w-full" viewBox="0 0 220 160" aria-hidden="true">
        <rect x="20" y="30" width="180" height="110" rx="10" fill="#ffffff" opacity="0.85" />
        <path d="M40 60 h140 M40 80 h110 M40 100 h130 M40 120 h80" stroke="#f59e0b" strokeWidth="4" />
        <circle cx="176" cy="52" r="14" fill="#fbbf24" />
      </svg>
    ),
  },
  TPA: {
    gradient: "from-violet-100 to-mint-100",
    chipText: "text-violet-700",
    archColor: ARCH_COLOR.TPA,
    tagTint: "bg-violet-50 text-violet-700",
    ageIcon: (
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path d="M12 3a7 7 0 0 0-7 7v9h14v-9a7 7 0 0 0-7-7Z" />
        <path d="M8 15h8" strokeLinecap="round" />
      </svg>
    ),
    arch: (
      <svg className="h-auto w-full" viewBox="0 0 220 160" aria-hidden="true">
        <path d="M110 18 Q 64 58 68 128 L 152 128 Q 156 58 110 18 Z" fill="#8b5cf6" opacity="0.85" />
        <path d="M110 40 Q 86 60 88 118 L 132 118 Q 134 60 110 40 Z" fill="#c4b5fd" opacity="0.9" />
        <circle cx="110" cy="16" r="6" fill="#f59e0b" />
        <rect x="58" y="126" width="104" height="12" rx="6" fill="#6d28d9" opacity="0.4" />
      </svg>
    ),
  },
};

const TAGS: Record<string, string[]> = {
  PAUD: ["Hijaiyah", "Doa Harian", "Fun Play"],
  TK: ["Tahsin", "Hafalan", "Calistung"],
  TPA: ["Juz 30", "Tajwid", "Praktik Ibadah"],
};

const LABEL_CHIP: Record<string, string> = {
  PAUD: "bg-primary text-on-primary",
  TK: "bg-gold-500 text-on-accent",
  TPA: "bg-violet-600 text-white",
};

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function ClassCard({ classItem, lang }: ClassCardProps) {
  const theme = THEMES[classItem.code] ?? THEMES.PAUD;
  const href = localizedHref(lang, `/kelas/${classItem.code.toLowerCase()}`);
  const tags = TAGS[classItem.code] ?? TAGS.PAUD;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-mint-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <a
        href={href}
        aria-label={`${lang === "en" ? `${classItem.nameEn} class profile` : `Profil kelas ${classItem.name}`}`}
        className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold shadow-sm ${theme.chipText}`}
        >
          {theme.ageIcon}
          {lang === "en" ? "Ages" : "Usia"} {classItem.ageMin}–{classItem.ageMax}
        </span>
        <span
          className={`absolute left-1/2 top-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 ${theme.archColor}`}
        >
          {theme.arch}
        </span>
        <span
          className={`absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${LABEL_CHIP[classItem.code] ?? LABEL_CHIP.PAUD}`}
        >
          {classItem.code}
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-bold text-mint-900">
          {lang === "en" ? classItem.nameEn : classItem.name}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-mint-800/70">
          {lang === "en" ? classItem.descriptionEn : classItem.description}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <span key={tag} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${theme.tagTint}`}>
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={href}
          className="mt-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-mint-300 text-sm font-extrabold text-mint-700 transition-colors hover:bg-mint-50"
        >
          {lang === "en" ? "View Class Profile" : "Lihat Profil Kelas"}
          <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}