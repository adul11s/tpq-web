import Link from "next/link";
import { localizedHref, type Lang } from "@/lib/lang";
import { ClassPhoto, type SceneKey } from "@/components/illustrations/PhotoScenes";
import type { ClassSummary } from "@/lib/types/class";

interface ClassCardProps {
  classItem: ClassSummary;
  lang: Lang;
}

interface ClassTheme {
  gradient: string;
  chipText: string;
  tagTint: string;
  ageIcon: React.ReactNode;
  scene: SceneKey;
}

const THEMES: Record<string, ClassTheme> = {
  PAUD: {
    gradient: "from-sky-100 to-mint-100",
    chipText: "text-sky-700",
    tagTint: "bg-mint-50 text-mint-700",
    ageIcon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="9" cy="8" r="3.2" />
        <circle cx="15.5" cy="10" r="4" />
        <circle cx="6" cy="15" r="3.2" />
      </svg>
    ),
    scene: "paud",
  },
  TK: {
    gradient: "from-gold-100 to-mint-100",
    chipText: "text-gold-700",
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
    scene: "tk",
  },
  TPA: {
    gradient: "from-violet-100 to-mint-100",
    chipText: "text-violet-700",
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
    scene: "tpa",
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
        <span className="absolute inset-0">
          <ClassPhoto name={theme.scene} />
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