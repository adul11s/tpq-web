import type { ResourceCategorySlug } from "@/lib/types/api";

/**
 * Cartoon category tiles for the Resource Dashboard.
 *
 * Hand-drawn inline SVG in the site palette (no photos, no licensing). Each tile
 * is a small still life a child recognises instantly: tasbih, mushaf on a rehal,
 * crayons, qalam + ink, worksheet.
 */

const TINT: Record<ResourceCategorySlug, { bg: string; ring: string }> = {
  prayers: { bg: "#e0f2fe", ring: "#bae6fd" },
  calligraphy: { bg: "#fef3c7", ring: "#fde68a" },
  coloring: { bg: "#ffe4e6", ring: "#fecdd3" },
  readings: { bg: "#ede9fe", ring: "#ddd6fe" },
  documents: { bg: "#d1fae5", ring: "#a7e3c4" },
};

const INK = "#3a2a20";

function Tasbih() {
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle
            key={i}
            cx={Math.cos(angle) * 46}
            cy={Math.sin(angle) * 46}
            r={7.5}
            fill="#0ea5e9"
            stroke="#0369a1"
            strokeWidth={1.5}
          />
        );
      })}
      <circle cx={0} cy={-58} r={9} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} />
      <path d="M0 54 L0 78" stroke="#0369a1" strokeWidth={3} strokeLinecap="round" />
      <path d="M0 78 Q-8 88 -2 96 Q6 92 0 78" fill="#f59e0b" />
    </g>
  );
}

function MushafOnRehal() {
  return (
    <g>
      <path d="M-56 26 L-14 -22 L-4 -12 L-46 36 Z" fill="#b4793c" />
      <path d="M56 26 L14 -22 L4 -12 L46 36 Z" fill="#96612f" />
      <path
        d="M-64 -14 Q0 -38 0 -22 Q0 -38 64 -14 L64 10 Q0 -14 0 2 Q0 -14 -64 10 Z"
        fill="#fffdf7"
        stroke="#e6dccb"
        strokeWidth={2}
      />
      <path d="M0 -22 L0 2" stroke="#e6dccb" strokeWidth={2} />
      <g stroke="#c7b9a3" strokeWidth={2.2} strokeLinecap="round">
        <path d="M-50 -8 Q-28 -18 -8 -6" fill="none" />
        <path d="M-48 0 Q-28 -10 -10 2" fill="none" />
        <path d="M8 -6 Q28 -18 50 -8" fill="none" />
        <path d="M10 2 Q28 -10 48 0" fill="none" />
      </g>
      <path d="M44 -24 L50 -46 L58 -24 Z" fill="#ef4444" />
    </g>
  );
}

function Crayons() {
  const bars = [
    { x: -52, color: "#ef4444", rot: -10 },
    { x: -26, color: "#f59e0b", rot: -4 },
    { x: 0, color: "#22c55e", rot: 2 },
    { x: 26, color: "#3b82f6", rot: 8 },
    { x: 52, color: "#a855f7", rot: 14 },
  ];
  return (
    <g>
      {bars.map((b) => (
        <g key={b.x} transform={`translate(${b.x} 0) rotate(${b.rot})`}>
          <rect x={-9} y={-46} width={18} height={92} rx={5} fill={b.color} />
          <rect x={-9} y={-46} width={18} height={20} rx={5} fill="#ffffff" opacity={0.25} />
          <path d={`M-9 -46 L0 -62 L9 -46 Z`} fill={b.color} />
        </g>
      ))}
      <path d="M-70 52 Q0 34 70 52" fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

function QalamAndInk() {
  return (
    <g>
      <rect x={-52} y={6} width={54} height={46} rx={10} fill="#0f766e" />
      <rect x={-58} y={-2} width={66} height={14} rx={7} fill="#115e59" />
      <ellipse cx={-25} cy={-2} rx={24} ry={6} fill="#042f2e" />
      <g transform="rotate(-28 20 -6)">
        <rect x={-6} y={-70} width={13} height={96} rx={5} fill="#f59e0b" />
        <path d="M-6 26 L0 48 L7 26 Z" fill={INK} />
        <rect x={-6} y={-70} width={13} height={12} rx={4} fill="#b45309" />
      </g>
      <path d="M6 44 Q40 30 62 44 Q44 60 6 44 Z" fill={INK} opacity={0.75} />
      <circle cx={62} cy={-38} r={4} fill={INK} opacity={0.5} />
    </g>
  );
}

function Worksheet() {
  return (
    <g>
      <g transform="rotate(-6)">
        <rect x={-54} y={-64} width={108} height={128} rx={8} fill="#ffffff" stroke="#e2e8f0" strokeWidth={2.5} />
        <path d="M-30 -60 L-30 60" stroke="#fecdd3" strokeWidth={2} />
        <g stroke="#94a3b8" strokeWidth={2.4} strokeLinecap="round">
          <path d="M-40 -38 L30 -38" />
          <path d="M-40 -20 L12 -20" />
          <path d="M-40 -2 L34 -2" />
          <path d="M-40 16 L8 16" />
          <path d="M-40 34 L28 34" />
        </g>
        <path d="M-14 52 L-2 40 L10 52 L22 40" fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" />
      </g>
      <g transform="translate(44 26) rotate(18)">
        <rect x={-6} y={-48} width={12} height={86} rx={3} fill="#fbbf24" />
        <path d="M-6 38 L0 54 L6 38 Z" fill="#f59e0b" />
        <path d="M-3 48 L0 56 L3 48 Z" fill={INK} />
        <rect x={-6} y={-48} width={12} height={10} rx={2} fill="#f472b6" />
      </g>
      <path d="M62 -34 L78 -42" stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
    </g>
  );
}

const PROPS: Record<ResourceCategorySlug, React.ReactNode> = {
  prayers: <Tasbih />,
  calligraphy: <QalamAndInk />,
  coloring: <Crayons />,
  readings: <MushafOnRehal />,
  documents: <Worksheet />,
};

interface CategoryIllustrationProps {
  category: ResourceCategorySlug;
  /** Kept for API compatibility with the previous photo implementation. */
  seed?: string;
}

export function CategoryIllustration({ category }: CategoryIllustrationProps) {
  const tint = TINT[category] ?? TINT.documents;
  const prop = PROPS[category] ?? PROPS.documents;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label={`Ilustrasi kartun kategori ${category}`}
    >
      <rect width="400" height="300" fill={tint.bg} />
      <circle cx={330} cy={62} r={54} fill={tint.ring} opacity={0.75} />
      <circle cx={62} cy={244} r={40} fill={tint.ring} opacity={0.6} />
      <g opacity={0.5} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M52 62 L64 74 L52 86 L40 74 Z" />
        <path d="M348 214 L360 226 L348 238 L336 226 Z" />
      </g>
      <g transform="translate(200 150) scale(1.55)">{prop}</g>
    </svg>
  );
}
