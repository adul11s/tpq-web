import type { ResourceCategorySlug } from "@/lib/types/api";

const MOTIFS: Record<
  ResourceCategorySlug,
  { from: string; to: string; accent: string; icon: React.ReactNode }
> = {
  prayers: {
    from: "#e0f2fe",
    to: "#f0f9ff",
    accent: "#0369a1",
    icon: (
      <>
        <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" fill="#bae6fd" />
        <path d="M9.5 10.5h5m-5 3.5h3" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  calligraphy: {
    from: "#fef3c7",
    to: "#fffbeb",
    accent: "#b45309",
    icon: (
      <>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" fill="#fde68a" />
        <path d="M12 20h9" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  coloring: {
    from: "#ffe4e6",
    to: "#fff1f2",
    accent: "#be123c",
    icon: (
      <>
        <circle cx="9" cy="8" r="2.6" fill="#fda4af" />
        <circle cx="12" cy="5.5" r="2.2" fill="#fecdd3" />
        <circle cx="15" cy="8" r="2.6" fill="#fb7185" />
        <path d="M7 13.5 12 7l5 6.5c1.2 1.5.4 4-1.5 4.5" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  readings: {
    from: "#ede9fe",
    to: "#f5f3ff",
    accent: "#6d28d9",
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z" fill="#ddd6fe" />
        <path d="M8 7.5h8M8 11h5" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  documents: {
    from: "#d1fae5",
    to: "#ecfdf5",
    accent: "#246f53",
    icon: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" fill="#a7e3c3" />
        <path d="M14 3v5h5M9 12h6m-6 3.5h6" stroke="#246f53" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
};

interface CategoryIllustrationProps {
  category: ResourceCategorySlug;
}

export function CategoryIllustration({ category }: CategoryIllustrationProps) {
  const motif = MOTIFS[category] ?? MOTIFS.documents;
  const gradientId = `ill-${category}`;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={motif.from} />
          <stop offset="1" stopColor={motif.to} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gradientId})`} />
      <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.7">
        <path d="M40 70 0 90 40 110 80 90Z" fill="none" />
        <path d="M60 130 30 150 60 170 90 150Z" fill="none" />
      </g>
      <g transform="translate(200 150) scale(5.2) translate(-12 -12)">
        {motif.icon}
      </g>
      <g stroke={motif.accent} strokeWidth="3" strokeLinecap="round" opacity="0.25">
        <path d="M320 70 280 90 320 110 360 90Z" fill="none" />
        <path d="M310 130 280 150 310 170 340 150Z" fill="none" />
      </g>
    </svg>
  );
}
