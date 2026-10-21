import type { Lang } from "@/lib/lang";

/**
 * Flat-illustration scenes for TPQ Qur'ani.
 *
 * Every scene is hand-built inline SVG (no external assets, no licensing
 * questions) and drawn in the site palette so cards, hero and tabs stay
 * visually consistent. Characters are simplified on purpose: covered hair,
 * dot eyes, soft smiles — friendly for kids, respectful for parents.
 */

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

const SKIN = ["#f7c9a4", "#eab08c", "#d69a72"] as const;
const GREEN = "#2b8a63";
const GREEN_DARK = "#205844";
const GREEN_SOFT = "#93d8b4";
const GOLD = "#fbbf24";
const GOLD_DARK = "#d97706";
const INK = "#3f2d24";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function Face({ y = -25 }: { y?: number }) {
  return (
    <g>
      <circle cx={-4} cy={y} r={1.6} fill={INK} />
      <circle cx={4} cy={y} r={1.6} fill={INK} />
      <path
        d={`M-3.6 ${y + 4.4} Q0 ${y + 7.6} 3.6 ${y + 4.4}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </g>
  );
}

/** Child wearing a hijab-style head cover (girls). */
function HijabKid({
  x,
  y,
  s = 1,
  cover,
  outfit,
  skin = SKIN[0],
}: {
  x: number;
  y: number;
  s?: number;
  cover: string;
  outfit: string;
  skin?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="26" rx="25" ry="6.5" fill={GREEN_DARK} opacity="0.12" />
      {/* crossed legs */}
      <path d="M-23 20 Q0 10 23 20 Q27 31 15 31 L-15 31 Q-27 31 -23 20 Z" fill={outfit} opacity="0.75" />
      {/* body */}
      <path d="M-16 22 Q-14 -6 0 -6 Q14 -6 16 22 Z" fill={outfit} />
      {/* arms resting on the lap */}
      <path d="M-15 4 Q-20 16 -12 19" fill="none" stroke={outfit} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M15 4 Q20 16 12 19" fill="none" stroke={outfit} strokeWidth="5.5" strokeLinecap="round" />
      {/* head cover behind the face */}
      <circle cx="0" cy="-25" r="15" fill={cover} />
      <path d="M-14.5 -22 Q-17 -4 0 -1.5 Q17 -4 14.5 -22 Z" fill={cover} />
      {/* face */}
      <path d="M-9.5 -26.5 A10 10 0 0 0 9.5 -26.5 L8.6 -19 Q0 -14.5 -8.6 -19 Z" fill={skin} />
      <Face />
    </g>
  );
}

/** Young boy with a kufi cap. */
function KufiKid({
  x,
  y,
  s = 1,
  cap,
  outfit,
  skin = SKIN[1],
}: {
  x: number;
  y: number;
  s?: number;
  cap: string;
  outfit: string;
  skin?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="26" rx="25" ry="6.5" fill={GREEN_DARK} opacity="0.12" />
      <path d="M-23 20 Q0 10 23 20 Q27 31 15 31 L-15 31 Q-27 31 -23 20 Z" fill={outfit} opacity="0.75" />
      <path d="M-16 22 Q-14 -6 0 -6 Q14 -6 16 22 Z" fill={outfit} />
      <path d="M-15 4 Q-20 16 -12 19" fill="none" stroke={outfit} strokeWidth="5.5" strokeLinecap="round" />
      <path d="M15 4 Q20 16 12 19" fill="none" stroke={outfit} strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="0" cy="-24" r="13" fill={skin} />
      <path d="M-12.4 -28 A12.6 12.6 0 0 1 12.4 -28 Z" fill={cap} />
      <rect x="-12.6" y="-29.6" width="25.2" height="3.4" rx="1.7" fill={cap} />
      <Face y={-24} />
    </g>
  );
}

/** Adult woman (ustadzah) — same recipe, taller, with a long dress. */
function Teacher({
  x,
  y,
  s = 1,
  cover,
  outfit,
  skin = SKIN[0],
}: {
  x: number;
  y: number;
  s?: number;
  cover: string;
  outfit: string;
  skin?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="40" rx="30" ry="7" fill={GREEN_DARK} opacity="0.12" />
      {/* long skirt */}
      <path d="M-22 38 Q-16 -8 0 -8 Q16 -8 22 38 Z" fill={outfit} />
      {/* arm holding a small book */}
      <path d="M-18 -2 Q-30 8 -22 16" fill="none" stroke={outfit} strokeWidth="7" strokeLinecap="round" />
      <path d="M18 -2 Q28 10 20 16" fill="none" stroke={outfit} strokeWidth="7" strokeLinecap="round" />
      {/* head cover */}
      <circle cx="0" cy="-30" r="16" fill={cover} />
      <path d="M-15.5 -27 Q-19 -2 0 1 Q19 -2 15.5 -27 Z" fill={cover} />
      <path d="M-10 -31.5 A10.6 10.6 0 0 0 10 -31.5 L9 -23 Q0 -18 -9 -23 Z" fill={skin} />
      <Face y={-30} />
    </g>
  );
}

/** Rehal (Quran stand) with an open mushaf. */
function Rehal({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="6" rx="34" ry="6" fill={GREEN_DARK} opacity="0.12" />
      {/* crossed legs */}
      <path d="M-24 4 L18 -22 L24 -16 L-18 10 Z" fill="#a1662f" />
      <path d="M24 4 L-18 -22 L-24 -16 L18 10 Z" fill="#8a5424" />
      {/* open pages */}
      <path d="M-30 -20 Q0 -30 0 -22 Q0 -30 30 -20 L30 -10 Q0 -18 0 -10 Q0 -18 -30 -10 Z" fill="#ffffff" />
      <path d="M0 -22 L0 -10" stroke="#e2e8f0" strokeWidth="1.4" />
      <g stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round">
        <path d="M-22 -18 Q-12 -20 -4 -17" fill="none" />
        <path d="M-21 -14 Q-12 -16 -5 -13" fill="none" />
        <path d="M4 -17 Q12 -20 22 -18" fill="none" />
        <path d="M5 -13 Q12 -16 21 -14" fill="none" />
      </g>
    </g>
  );
}

function Sun({ cx, cy, r = 26 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fcd34d" />
      <circle cx={cx} cy={cy} r={r * 0.76} fill={GOLD} />
    </g>
  );
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 14 Q-4 0 12 0 Q18 -10 32 -6 Q44 -10 46 4 Q58 4 56 14 Z"
      fill="#ffffff"
      opacity="0.92"
    />
  );
}

function Flower({ x, y, s = 1, petal, center }: { x: number; y: number; s?: number; petal: string; center: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L0 12" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="0" cy="-5" r="5" fill={petal} />
      <circle cx="-5" cy="0" r="5" fill={petal} />
      <circle cx="5" cy="0" r="5" fill={petal} />
      <circle cx="0" cy="4" r="5" fill={petal} />
      <circle cx="0" cy="0" r="3.2" fill={center} />
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-18" width="10" height="24" rx="4" fill="#a1662f" />
      <circle cx="0" cy="-34" r="24" fill={GREEN_SOFT} />
      <circle cx="-16" cy="-24" r="16" fill={GREEN} opacity="0.85" />
      <circle cx="16" cy="-24" r="16" fill={GREEN} opacity="0.85" />
      <circle cx="0" cy="-42" r="15" fill="#5cbf8e" />
    </g>
  );
}

function Sparkle({ x, y, s = 1, fill = GOLD }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
      fill={fill}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

/**
 * Hero: a Qur'ani study circle — ustadzah, three children, an open mushaf
 * on a rehal, with the TPQ building (dome + minarets) behind them.
 */
export function HeroScene() {
  return (
    <svg className="h-auto w-full" viewBox="0 0 480 400" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7f2e4" />
          <stop offset="1" stopColor="#fdf6e3" />
        </linearGradient>
        <clipPath id="scene-clip">
          <rect x="20" y="20" width="440" height="360" rx="48" />
        </clipPath>
      </defs>
      <rect x="20" y="20" width="440" height="360" rx="48" fill="url(#scene-sky)" />

      <g clipPath="url(#scene-clip)">
        <Sun cx={392} cy={82} />
        <Cloud x={58} y={72} />
        <Cloud x={300} y={54} s={0.8} />
        <Sparkle x={92} y={44} s={0.9} />
        <Sparkle x={446} y={132} s={0.7} fill={GOLD_DARK} />
        <Sparkle x={40} y={168} s={0.6} />

        {/* TPQ building on the lawn */}
        <ellipse cx="240" cy="330" rx="215" ry="70" fill="#a7e3c3" />
        <g>
          <rect x="150" y="212" width="180" height="106" rx="10" fill="#ffffff" opacity="0.95" />
          <rect x="150" y="212" width="180" height="14" rx="7" fill={GREEN_SOFT} />
          {/* dome + finial */}
          <path d="M240 148 Q 178 196 184 262 L 296 262 Q 302 196 240 148 Z" fill={GREEN} />
          <path d="M240 170 Q 198 206 202 256 L 278 256 Q 282 206 240 170 Z" fill={GREEN_SOFT} opacity="0.85" />
          <circle cx="240" cy="132" r="9" fill={GOLD_DARK} />
          <path d="M240 116 L 243.6 126 L 254 127 L 246 134 L 248.6 144.6 L 240 138.6 L 231.4 144.6 L 234 134 L 226 127 L 236.4 126 Z" fill={GOLD} />
          {/* minarets */}
          <rect x="126" y="196" width="16" height="122" rx="7" fill={GREEN_SOFT} />
          <rect x="338" y="196" width="16" height="122" rx="7" fill={GREEN_SOFT} />
          <circle cx="134" cy="190" r="11" fill={GREEN} />
          <circle cx="346" cy="190" r="11" fill={GREEN} />
          {/* door + windows */}
          <path d="M224 318 L224 274 Q240 258 256 274 L256 318 Z" fill={GREEN_DARK} />
          <circle cx="240" cy="286" r="4.5" fill={GOLD} />
          <path d="M178 318 L178 282 Q188 272 198 282 L198 318 Z" fill={GREEN_SOFT} />
          <path d="M282 318 L282 282 Q292 272 302 282 L302 318 Z" fill={GREEN_SOFT} />
        </g>

        <Tree x={78} y={318} s={1.05} />
        <Tree x={410} y={312} s={0.9} />

        {/* study circle on the rug */}
        <ellipse cx="240" cy="352" rx="176" ry="34" fill="#ffffff" opacity="0.9" />
        <ellipse cx="240" cy="352" rx="176" ry="34" fill="none" stroke={GOLD} strokeWidth="4" strokeDasharray="10 9" />

        <Teacher x={128} y={292} s={1.32} cover="#0ea5e9" outfit="#38bdf8" skin={SKIN[0]} />
        {/* small book in the teacher's hand */}
        <g transform="translate(88 320) rotate(-14)">
          <rect x="-15" y="-10" width="30" height="20" rx="3" fill="#ffffff" />
          <path d="M0 -10 L0 10" stroke={GOLD} strokeWidth="2" />
        </g>

        <Rehal x={236} y={340} s={1.05} />

        <KufiKid x={312} y={318} cap={GOLD} outfit={GOLD_DARK} skin={SKIN[1]} />
        <HijabKid x={372} y={330} s={0.92} cover="#fb7185" outfit="#f43f5e" skin={SKIN[2]} />
        <HijabKid x={196} y={344} s={0.86} cover="#a78bfa" outfit="#8b5cf6" skin={SKIN[0]} />

        <Flower x={54} y={352} petal="#f9a8d4" center={GOLD} />
        <Flower x={438} y={346} s={0.9} petal={GOLD} center="#f43f5e" />
        <Flower x={402} y={368} s={0.7} petal="#f9a8d4" center={GOLD} />
      </g>
    </svg>
  );
}

/**
 * PAUD (ages 3–4): toddlers playing with big hijaiyah blocks — learning
 * letters through play, the programme's actual selling point.
 */
export function PaudScene() {
  return (
    <svg className="h-auto w-full" viewBox="0 0 320 240" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="paud-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#d7f2e4" />
        </linearGradient>
        <clipPath id="paud-clip">
          <rect width="320" height="240" rx="28" />
        </clipPath>
      </defs>
      <rect width="320" height="240" fill="url(#paud-bg)" />
      <g clipPath="url(#paud-clip)">
        <Sun cx={272} cy={48} r={20} />
        <Cloud x={36} y={34} s={0.62} />
        <Sparkle x={140} y={30} s={0.7} />

        <ellipse cx="160" cy="214" rx="150" ry="26" fill="#ffffff" opacity="0.75" />

        {/* stacked hijaiyah blocks */}
        <g>
          <rect x="128" y="150" width="44" height="44" rx="10" fill={GOLD} />
          <text x="150" y="182" textAnchor="middle" fontSize="28" fontWeight="800" fill={GREEN_DARK}>
            ا
          </text>
          <rect x="128" y="106" width="44" height="44" rx="10" fill="#fb7185" />
          <text x="150" y="138" textAnchor="middle" fontSize="28" fontWeight="800" fill="#ffffff">
            ب
          </text>
          <rect x="176" y="150" width="44" height="44" rx="10" fill="#38bdf8" />
          <text x="198" y="182" textAnchor="middle" fontSize="28" fontWeight="800" fill={GREEN_DARK}>
            ت
          </text>
        </g>

        <HijabKid x={78} y={172} s={0.98} cover="#38bdf8" outfit="#0ea5e9" skin={SKIN[0]} />
        <KufiKid x={244} y={180} s={0.92} cap={GREEN_SOFT} outfit={GREEN} skin={SKIN[2]} />

        {/* crayon + ball, the “fun play” props */}
        <g transform="translate(40 208) rotate(-18)">
          <rect x="-20" y="-6" width="34" height="12" rx="4" fill="#f43f5e" />
          <path d="M14 -6 L26 0 L14 6 Z" fill="#fecdd3" />
        </g>
        <circle cx="286" cy="206" r="12" fill="#ffffff" />
        <path d="M274 206 a12 12 0 0 1 24 0" fill="#f43f5e" opacity="0.85" />
        <Flower x={296} y={160} s={0.62} petal="#f9a8d4" center={GOLD} />
      </g>
    </svg>
  );
}

/**
 * TK (ages 5–6): tahsin time — a child reads the mushaf while the
 * ustadzah points at a whiteboard of hijaiyah letters.
 */
export function TkScene() {
  return (
    <svg className="h-auto w-full" viewBox="0 0 320 240" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="tk-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d7f2e4" />
        </linearGradient>
        <clipPath id="tk-clip">
          <rect width="320" height="240" rx="28" />
        </clipPath>
      </defs>
      <rect width="320" height="240" fill="url(#tk-bg)" />
      <g clipPath="url(#tk-clip)">
        <Sparkle x={286} y={34} s={0.7} />
        <Cloud x={22} y={26} s={0.55} />

        {/* whiteboard with hijaiyah letters */}
        <g>
          <rect x="150" y="34" width="146" height="92" rx="12" fill="#ffffff" />
          <rect x="150" y="34" width="146" height="92" rx="12" fill="none" stroke={GREEN_SOFT} strokeWidth="4" />
          <g fill={GREEN_DARK} fontSize="30" fontWeight="800" textAnchor="middle">
            <text x="186" y="80">
              ح
            </text>
            <text x="226" y="80">
              ص
            </text>
            <text x="266" y="80">
              م
            </text>
          </g>
          <path d="M170 100 h106" stroke={GOLD} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
          <rect x="212" y="126" width="22" height="8" rx="4" fill="#a1662f" />
        </g>

        <Teacher x={92} y={132} s={0.78} cover={GREEN} outfit={GREEN_SOFT} skin={SKIN[1]} />
        {/* pointer stick */}
        <path d="M114 118 L166 78" stroke="#a1662f" strokeWidth="4" strokeLinecap="round" />

        <Rehal x={226} y={186} s={0.78} />
        <KufiKid x={158} y={182} s={0.9} cap={GOLD} outfit={GOLD_DARK} skin={SKIN[0]} />

        <ellipse cx="160" cy="214" rx="150" ry="26" fill="#ffffff" opacity="0.6" />
        <Flower x={40} y={202} s={0.7} petal={GOLD} center="#f43f5e" />
        <Flower x={296} y={206} s={0.6} petal="#f9a8d4" center={GOLD} />
      </g>
    </svg>
 );
}

/**
 * TPA (ages 7–12): halaqah — children seated in a row on prayer mats
 * with rehal and mushaf, mosque arch behind them.
 */
export function TpaScene() {
  return (
    <svg className="h-auto w-full" viewBox="0 0 320 240" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="tpa-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ede9fe" />
          <stop offset="1" stopColor="#d7f2e4" />
        </linearGradient>
        <clipPath id="tpa-clip">
          <rect width="320" height="240" rx="28" />
        </clipPath>
      </defs>
      <rect width="320" height="240" fill="url(#tpa-bg)" />
      <g clipPath="url(#tpa-clip)">
        <Sparkle x={288} y={40} s={0.7} fill="#8b5cf6" />
        <Sparkle x={30} y={64} s={0.55} fill={GOLD} />

        {/* mihrab arch */}
        <path d="M160 26 Q 96 78 100 176 L 220 176 Q 224 78 160 26 Z" fill="#c4b5fd" opacity="0.55" />
        <path d="M160 48 Q 118 86 121 170 L 199 170 Q 202 86 160 48 Z" fill="#ede9fe" />
        <circle cx="160" cy="20" r="6" fill={GOLD_DARK} />

        <ellipse cx="160" cy="200" rx="150" ry="30" fill="#ffffff" opacity="0.7" />
        {/* prayer mats */}
        <g>
          <rect x="52" y="176" width="80" height="34" rx="10" fill="#8b5cf6" opacity="0.35" />
          <rect x="140" y="182" width="80" height="34" rx="10" fill={GOLD} opacity="0.45" />
          <rect x="228" y="176" width="80" height="34" rx="10" fill="#38bdf8" opacity="0.4" />
        </g>

        <HijabKid x={92} y={168} s={0.94} cover="#8b5cf6" outfit="#7c3aed" skin={SKIN[2]} />
        <Rehal x={180} y={176} s={0.72} />
        <KufiKid x={262} y={168} s={0.94} cap={GREEN} outfit={GREEN_DARK} skin={SKIN[0]} />
        <HijabKid x={176} y={196} s={0.78} cover="#38bdf8" outfit="#0284c7" skin={SKIN[1]} />

        <Flower x={30} y={210} s={0.62} petal="#f9a8d4" center={GOLD} />
        <Flower x={298} y={212} s={0.58} petal={GOLD} center="#f43f5e" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export type SceneKey = "hero" | "paud" | "tk" | "tpa";

const SCENES: Record<SceneKey, () => React.ReactElement> = {
  hero: HeroScene,
  paud: PaudScene,
  tk: TkScene,
  tpa: TpaScene,
};

export function Scene({ name }: { name: SceneKey }) {
  const Comp = SCENES[name];
  return <Comp />;
}

/** Compact hero for localized landing pages. */
export function LandingHeroScene({ lang }: { lang: Lang }) {
  void lang;
  return <HeroScene />;
}
