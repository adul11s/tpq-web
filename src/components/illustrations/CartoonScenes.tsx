/**
 * Cartoon scenes for TPQ Qur'ani — Muslim / Muslimah characters drawn inline as
 * SVG (no stock photography, no licensing questions, scales crisply).
 *
 * Age-appropriate proportions are the point of this file: PAUD gets a big head
 * and short body (toddler), TK a leaner build, TPA the leanest with the longest
 * body. Girls wear a hijab, boys a peci, and each scene shows the activity that
 * class advertises: blocks → coloring → reading the Qur'an.
 */

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

const SKIN = ["#f8cfae", "#eab392", "#d59a72"] as const;
const INK = "#3a2a20";
const GREEN = "#2f9e6f";
const GREEN_DARK = "#1f6b4c";
const GREEN_SOFT = "#a7e3c4";
const GOLD = "#f9c74f";
const GOLD_DARK = "#d98324";
const CREAM = "#fdf6e3";
const PINK = "#f9a8d4";
const PURPLE = "#a78bfa";

export type Age = "paud" | "tk" | "tpa";
type Gender = "girl" | "boy";

/** Head radius + body height per age band. Younger = bigger head, shorter body. */
const PROPORTIONS: Record<Age, { head: number; body: number; eye: number }> = {
  paud: { head: 28, body: 20, eye: 1.2 },
  tk: { head: 24, body: 30, eye: 1.06 },
  tpa: { head: 20, body: 42, eye: 0.98 },
};

const OUTLINE = {
  stroke: INK,
  strokeWidth: 2,
  strokeLinejoin: "round" as const,
  strokeOpacity: 0.5,
};

/* ------------------------------------------------------------------ */
/* Face parts                                                          */
/* ------------------------------------------------------------------ */

function Eyes({
  y,
  scale = 1,
  happy = false,
  lookDown = false,
  gazeX = 0,
}: {
  y: number;
  scale?: number;
  happy?: boolean;
  lookDown?: boolean;
  gazeX?: number;
}) {
  if (happy) {
    return (
      <g stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round">
        <path d={`M-8.6 ${y} Q-5.2 ${y - 4} -1.8 ${y}`} />
        <path d={`M1.8 ${y} Q5.2 ${y - 4} 8.6 ${y}`} />
      </g>
    );
  }
  return (
    <g transform={`translate(0 ${y}) scale(${scale})`}>
      <ellipse cx={-5.2} cy={0} rx={4} ry={4.6} fill="#ffffff" stroke={INK} strokeWidth={1.2} />
      <ellipse cx={5.2} cy={0} rx={4} ry={4.6} fill="#ffffff" stroke={INK} strokeWidth={1.2} />
      <circle cx={-4.7 + gazeX} cy={lookDown ? 2.2 : 0.6} r={2.5} fill={INK} />
      <circle cx={4.7 + gazeX} cy={lookDown ? 2.2 : 0.6} r={2.5} fill={INK} />
      <circle cx={-5.8 + gazeX} cy={lookDown ? 0.1 : -0.9} r={0.9} fill="#ffffff" />
      <circle cx={3.8 + gazeX} cy={lookDown ? 0.1 : -0.9} r={0.9} fill="#ffffff" />
      <path d="M-8.4 -6.8 Q-5.2 -8.8 -2 -6.8" fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
      <path d="M2 -6.8 Q5.2 -8.8 8.4 -6.8" fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
    </g>
  );
}

function Smile({ y }: { y: number }) {
  return (
    <g>
      <path d={`M-5.2 ${y} Q0 ${y + 5} 5.2 ${y}`} fill="none" stroke={INK} strokeWidth={1.7} strokeLinecap="round" />
      <ellipse cx={0} cy={y + 5.2} rx={2.2} ry={1} fill={PINK} opacity={0.8} />
    </g>
  );
}

function Blush({ y }: { y: number }) {
  return (
    <>
      <ellipse cx={-10} cy={y} rx={3.8} ry={2.3} fill={PINK} opacity={0.55} />
      <ellipse cx={10} cy={y} rx={3.8} ry={2.3} fill={PINK} opacity={0.55} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

function SmallBook({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M-17 0 Q0 -8 0 -2 Q0 -8 17 0 L17 6 Q0 -1 0 5 Q0 -1 -17 6 Z"
        fill="#fffdf7"
        stroke="#c9bda8"
        strokeWidth={1.4}
      />
      <path d="M0 -2 L0 5" stroke="#c9bda8" strokeWidth={1.2} />
      <path d="M-13 1 Q-6 -2 -2 0" fill="none" stroke="#b9ab95" strokeWidth={1.1} strokeLinecap="round" />
      <path d="M2 0 Q6 -2 13 1" fill="none" stroke="#b9ab95" strokeWidth={1.1} strokeLinecap="round" />
    </g>
  );
}

/** Open mushaf on a wooden rehal (Qur'an stand). */
function Rehal({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={7} rx={38} ry={6} fill={GREEN_DARK} opacity={0.12} />
      <path d="M-26 5 L17 -22 L23 -16 L-20 11 Z" fill="#b4793c" stroke="#8a5a2b" strokeWidth={1.2} />
      <path d="M26 5 L-17 -22 L-23 -16 L20 11 Z" fill="#96612f" stroke="#7a4d22" strokeWidth={1.2} />
      <path
        d="M-33 -18 Q0 -31 0 -22 Q0 -31 33 -18 L33 -5 Q0 -15 0 -6 Q0 -15 -33 -5 Z"
        fill="#fffdf7"
        stroke="#c9bda8"
        strokeWidth={1.6}
      />
      <path d="M0 -22 L0 -6" stroke="#c9bda8" strokeWidth={1.4} />
      <g stroke="#b9ab95" strokeWidth={1.4} strokeLinecap="round">
        <path d="M-25 -17 Q-13 -21 -4 -16" fill="none" />
        <path d="M-24 -12 Q-13 -16 -5 -11" fill="none" />
        <path d="M4 -16 Q13 -21 25 -17" fill="none" />
        <path d="M5 -11 Q13 -16 24 -12" fill="none" />
      </g>
      <path d="M-2 -22 L-2 -33 L3 -33 L3 -22 Z" fill="#ef4444" />
      <text
        x={-16}
        y={-7}
        textAnchor="middle"
        fontSize={13}
        style={{ fontFamily: "var(--font-amiri, Amiri, serif)" }}
        fill="#8b7a63"
        direction="rtl"
      >
        القرآن
      </text>
      <g stroke="#bfae95" strokeWidth={1} strokeLinecap="round">
        <path d="M10 -14 L28 -14" />
        <path d="M12 -10 L30 -10" />
        <path d="M10 -6 L26 -6" />
      </g>
    </g>
  );
}

function HijaiyahBlock({
  x,
  y,
  s = 1,
  fill,
  letter,
}: {
  x: number;
  y: number;
  s?: number;
  fill: string;
  letter: string;
}) {
  const size = 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${-8 + (letter.charCodeAt(0) % 4) * 5})`}>
      <rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        rx={7}
        fill={fill}
        stroke={INK}
        strokeOpacity={0.45}
        strokeWidth={1.8}
      />
      <rect x={-size / 2 + 4} y={-size / 2 + 4} width={size - 8} height={5} rx={2.5} fill="#ffffff" opacity={0.32} />
      <text
        x={0}
        y={size * 0.22}
        textAnchor="middle"
        fontSize={size * 0.86}
        fontWeight={700}
        style={{ fontFamily: "var(--font-amiri, Amiri, serif)" }}
        fill="#ffffff"
        stroke="#00000022"
        strokeWidth={0.6}
        direction="rtl"
      >
        {letter}
      </text>
    </g>
  );
}

function Crayon({ x, y, rot = 0, color }: { x: number; y: number; rot?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect
        x={-4.5}
        y={-16}
        width={9}
        height={30}
        rx={3}
        fill={color}
        stroke={INK}
        strokeOpacity={0.4}
        strokeWidth={1.4}
      />
      <path d="M-4.5 -16 L0 -24 L4.5 -16 Z" fill={color} stroke={INK} strokeOpacity={0.4} strokeWidth={1.4} />
      <rect x={-4.5} y={-2} width={9} height={9} rx={1} fill="#ffffff" opacity={0.5} />
    </g>
  );
}

function Hand({ x, y, head, skin, flip = 1 }: { x: number; y: number; head: number; skin: string; flip?: 1 | -1 }) {
  const r = head * 0.13;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={r} fill={skin} stroke={INK} strokeOpacity={0.32} strokeWidth={1.4} />
      <g fill={skin} stroke={INK} strokeOpacity={0.28} strokeWidth={1}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={flip * (r * 0.45 + i * r * 0.5)} cy={-r * 0.55} r={r * 0.32} />
        ))}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Character                                                           */
/* ------------------------------------------------------------------ */

interface KidProps {
  x: number;
  y: number;
  age: Age;
  gender: Gender;
  outfit: string;
  accent: string;
  skin?: string;
  s?: number;
  /** 1 = turned right, -1 = turned left, 0 = facing the viewer. */
  facing?: 1 | -1 | 0;
  happy?: boolean;
  holding?: "book" | "block" | "crayon" | "none" | "reach";
}

/**
 * Seated cartoon child. Origin sits at the baseline of the crossed legs; the body
 * grows upward. `facing` mirrors the figure and tilts the head toward the object
 * it holds, which is what makes the "reading together" pose read correctly.
 */
function Kid({
  x,
  y,
  age,
  gender,
  outfit,
  accent,
  skin = SKIN[0],
  s = 1,
  facing = 0,
  happy = false,
  holding = "none",
}: KidProps) {
  const { head, body, eye } = PROPORTIONS[age];
  const headCy = -(body + head * 0.95);
  const shoulderY = -body;
  const mirror = facing === -1 ? -1 : 1;
  const tilt = facing === 0 ? 0 : 9 * mirror;

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={3} rx={head * 1.15} ry={head * 0.24} fill={GREEN_DARK} opacity={0.13} />

      {/* torso + crossed legs */}
      <path
        d={`M${-head * 0.68} 0 Q${-head * 0.66} ${shoulderY - head * 0.16} 0 ${shoulderY - head * 0.2} Q${head * 0.66} ${shoulderY - head * 0.16} ${head * 0.68} 0 Q${head * 0.4} ${head * 0.22} 0 ${head * 0.22} Q${-head * 0.4} ${head * 0.22} ${-head * 0.68} 0 Z`}
        fill={outfit}
        {...OUTLINE}
      />
      <ellipse
        cx={-head * 0.5}
        cy={head * 0.02}
        rx={head * 0.3}
        ry={head * 0.21}
        fill={outfit}
        stroke={INK}
        strokeOpacity={0.35}
        strokeWidth={1.6}
      />
      <ellipse
        cx={head * 0.5}
        cy={head * 0.02}
        rx={head * 0.3}
        ry={head * 0.21}
        fill={outfit}
        stroke={INK}
        strokeOpacity={0.35}
        strokeWidth={1.6}
      />
      <path
        d={`M${-head * 0.26} ${shoulderY - head * 0.14} Q0 ${shoulderY + head * 0.02} ${head * 0.26} ${shoulderY - head * 0.14}`}
        fill="none"
        stroke={accent}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* head (tilts toward the held object) */}
      <g transform={`rotate(${tilt} 0 ${headCy + head})`}>
        {gender === "girl" ? (
          <g>
            <path
              d={`M${-head * 0.98} ${headCy + head * 0.05} Q${-head * 1.24} ${headCy + head * 1.15} ${-head * 0.62} ${shoulderY - head * 0.02} L${head * 0.62} ${shoulderY - head * 0.02} Q${head * 1.24} ${headCy + head * 1.15} ${head * 0.98} ${headCy + head * 0.05} Z`}
              fill={accent}
              {...OUTLINE}
            />
            <path
              d={`M${-head * 0.62} ${shoulderY - head * 0.02} Q${-head * 0.34} ${shoulderY + head * 0.14} ${-head * 0.08} ${shoulderY - head * 0.02} Q${head * 0.18} ${shoulderY + head * 0.14} ${head * 0.44} ${shoulderY - head * 0.02} Q${head * 0.54} ${shoulderY + head * 0.1} ${head * 0.62} ${shoulderY - head * 0.02}`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.35}
              strokeWidth={2}
            />
            <circle cx={0} cy={headCy} r={head} fill={accent} {...OUTLINE} />
            <path
              d={`M${-head * 0.92} ${headCy - head * 0.32} Q0 ${headCy - head * 1.06} ${head * 0.92} ${headCy - head * 0.32} Q${head * 0.5} ${headCy - head * 0.72} 0 ${headCy - head * 0.76} Q${-head * 0.5} ${headCy - head * 0.72} ${-head * 0.92} ${headCy - head * 0.32} Z`}
              fill="#ffffff"
              opacity={0.18}
            />
            <path
              d={`M${-head * 0.66} ${headCy - head * 0.12} Q0 ${headCy - head * 0.46} ${head * 0.66} ${headCy - head * 0.12} Q${head * 0.6} ${headCy + head * 0.62} 0 ${headCy + head * 0.8} Q${-head * 0.6} ${headCy + head * 0.62} ${-head * 0.66} ${headCy - head * 0.12} Z`}
              fill={skin}
            />
          </g>
        ) : (
          <g>
            <circle cx={0} cy={headCy} r={head} fill={skin} {...OUTLINE} />
            <path
              d={`M${-head * 0.97} ${headCy - head * 0.22} Q${-head * 0.66} ${headCy + head * 0.08} ${-head * 0.4} ${headCy - head * 0.28} Q0 ${headCy + head * 0.02} ${head * 0.4} ${headCy - head * 0.28} Q${head * 0.66} ${headCy + head * 0.08} ${head * 0.97} ${headCy - head * 0.22} Q${head * 0.6} ${headCy - head * 1} 0 ${headCy - head * 1.02} Q${-head * 0.6} ${headCy - head * 1} ${-head * 0.97} ${headCy - head * 0.22} Z`}
              fill="#2b2118"
            />
            <path
              d={`M${-head * 0.92} ${headCy - head * 0.26} Q${-head * 0.86} ${headCy - head * 1.26} 0 ${headCy - head * 1.28} Q${head * 0.86} ${headCy - head * 1.26} ${head * 0.92} ${headCy - head * 0.26} Q0 ${headCy - head * 0.68} ${-head * 0.92} ${headCy - head * 0.26} Z`}
              fill={accent}
              {...OUTLINE}
            />
            <path
              d={`M${-head * 0.87} ${headCy - head * 0.44} Q0 ${headCy - head * 0.84} ${head * 0.87} ${headCy - head * 0.44}`}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.32}
              strokeWidth={2.4}
            />
          </g>
        )}

        <g transform={`translate(0 ${headCy + head * 0.16})`}>
          <Eyes y={0} scale={eye} happy={happy} lookDown={holding !== "none"} gazeX={facing === 0 ? 0 : 1.9 * mirror} />
          <Smile y={head * 0.3} />
          <Blush y={head * 0.24} />
        </g>
      </g>

      {/* arms + held object */}
      {holding === "book" && (
        <g>
          <path
            d={`M${-head * 0.58} ${shoulderY + head * 0.06} Q${-head * 0.74} ${head * 0.12} ${-head * 0.36} ${head * 0.0}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${-head * 0.58} ${shoulderY + head * 0.06} Q${-head * 0.74} ${head * 0.12} ${-head * 0.36} ${head * 0.0}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <path
            d={`M${head * 0.58} ${shoulderY + head * 0.06} Q${head * 0.74} ${head * 0.12} ${head * 0.36} ${head * 0.0}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${head * 0.58} ${shoulderY + head * 0.06} Q${head * 0.74} ${head * 0.12} ${head * 0.36} ${head * 0.0}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <SmallBook x={0} y={-head * 0.02} s={head * 0.05} />
          <circle cx={-head * 0.34} cy={head * 0.0} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
          <circle cx={head * 0.34} cy={head * 0.0} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
        </g>
      )}

      {holding === "block" && (
        <g>
          <path
            d={`M${head * 0.52} ${shoulderY + head * 0.12} Q${head * 0.9} ${shoulderY + head * 0.52} ${head * 0.58} ${head * 0.02}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${head * 0.52} ${shoulderY + head * 0.12} Q${head * 0.9} ${shoulderY + head * 0.52} ${head * 0.58} ${head * 0.02}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <path
            d={`M${-head * 0.54} ${shoulderY + head * 0.16} Q${-head * 0.78} ${shoulderY + head * 0.5} ${-head * 0.32} ${head * 0.02}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${-head * 0.54} ${shoulderY + head * 0.16} Q${-head * 0.78} ${shoulderY + head * 0.5} ${-head * 0.32} ${head * 0.02}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <circle cx={head * 0.58} cy={head * 0.01} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
          <circle cx={-head * 0.32} cy={head * 0.03} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
          <HijaiyahBlock x={head * 0.8} y={-head * 0.02} s={0.8} fill="#f59e0b" letter="ب" />
        </g>
      )}

      {holding === "crayon" && (
        <g>
          <path
            d={`M${head * 0.54} ${shoulderY + head * 0.12} Q${head * 0.92} ${shoulderY + head * 0.54} ${head * 0.64} ${head * 0.02}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${head * 0.54} ${shoulderY + head * 0.12} Q${head * 0.92} ${shoulderY + head * 0.54} ${head * 0.64} ${head * 0.02}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <path
            d={`M${-head * 0.54} ${shoulderY + head * 0.16} Q${-head * 0.78} ${shoulderY + head * 0.5} ${-head * 0.32} ${head * 0.02}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${-head * 0.54} ${shoulderY + head * 0.16} Q${-head * 0.78} ${shoulderY + head * 0.5} ${-head * 0.32} ${head * 0.02}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <circle cx={head * 0.64} cy={head * 0.01} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
          <circle cx={-head * 0.32} cy={head * 0.03} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
          <Crayon x={head * 0.76} y={head * 0.06} rot={20} color="#ef4444" />
        </g>
      )}

      {holding === "reach" && (
        <g>
          <path
            d={`M${head * 0.55} ${shoulderY + head * 0.16} Q${head * 1.1} ${shoulderY + head * 0.42} ${head * 1.22} ${-head * 0.1}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
          <path
            d={`M${head * 0.55} ${shoulderY + head * 0.16} Q${head * 1.1} ${shoulderY + head * 0.42} ${head * 1.22} ${-head * 0.1}`}
            fill="none"
            stroke={skin}
            strokeWidth={6.5}
            strokeLinecap="round"
          />
          <circle cx={head * 1.24} cy={-head * 0.1} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
          <path
            d={`M${head * 1.3} ${-head * 0.14} L${head * 1.44} ${-head * 0.18}`}
            stroke={skin}
            strokeWidth={head * 0.075}
            strokeLinecap="round"
          />
          <path
            d={`M${-head * 0.55} ${shoulderY + head * 0.16} Q${-head * 0.8} ${shoulderY + head * 0.5} ${-head * 0.34} ${head * 0.02}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
          <path
            d={`M${-head * 0.55} ${shoulderY + head * 0.16} Q${-head * 0.8} ${shoulderY + head * 0.5} ${-head * 0.34} ${head * 0.02}`}
            fill="none"
            stroke={skin}
            strokeWidth={6.5}
            strokeLinecap="round"
          />
          <circle cx={-head * 0.34} cy={head * 0.03} r={head * 0.11} fill={skin} stroke={INK} strokeOpacity={0.3} strokeWidth={1.4} />
        </g>
      )}

      {holding === "none" && (
        <g>
          <path
            d={`M${-head * 0.56} ${shoulderY + head * 0.14} Q${-head * 0.82} ${shoulderY + head * 0.5} ${-head * 0.34} ${head * 0.02}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${-head * 0.56} ${shoulderY + head * 0.14} Q${-head * 0.82} ${shoulderY + head * 0.5} ${-head * 0.34} ${head * 0.02}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <path
            d={`M${head * 0.56} ${shoulderY + head * 0.14} Q${head * 0.82} ${shoulderY + head * 0.5} ${head * 0.34} ${head * 0.02}`}
            fill="none"
            stroke={INK}
            strokeOpacity={0.35}
            strokeWidth={10}
            strokeLinecap="round"
          />
<path
            d={`M${head * 0.56} ${shoulderY + head * 0.14} Q${head * 0.82} ${shoulderY + head * 0.5} ${head * 0.34} ${head * 0.02}`}
            fill="none"
            stroke={skin}
                        strokeWidth={6.5}
            strokeLinecap="round"
          />
          <circle cx={-head * 0.34} cy={head * 0.03} r={head * 0.1} fill={skin} />
          <circle cx={head * 0.34} cy={head * 0.03} r={head * 0.1} fill={skin} />
        </g>
      )}
    </g>
  );
}

function Sparkle({ x, y, s = 1, fill = GOLD }: { x: number; y: number; s?: number; fill?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill={fill} />;
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 12 Q-6 -2 10 -2 Q16 -14 32 -8 Q46 -12 48 4 Q60 4 58 12 Z"
      fill="#ffffff"
      opacity={0.92}
    />
  );
}

function StarPattern() {
  return (
    <g opacity={0.3} stroke={GREEN_SOFT} strokeWidth={2} fill="none">
      <path d="M56 44 L68 56 L56 68 L44 56 Z" />
      <path d="M302 26 L316 40 L302 54 L288 40 Z" />
      <path d="M424 118 L436 130 L424 142 L412 130 Z" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

/** Hero: ustadzah + two santri reading their own mushaf, mosque skyline behind. */
export function HeroScene() {
  return (
    <svg
      className="h-auto w-full"
      viewBox="0 0 480 400"
      role="img"
      aria-label="Ustadzah dan dua santri membaca Al-Qur'an bersama"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7f2e4" />
          <stop offset="1" stopColor="#fdf6e3" />
        </linearGradient>
        <clipPath id="hero-clip">
          <rect x="8" y="8" width="464" height="384" rx="38" />
        </clipPath>
      </defs>
      <rect x="8" y="8" width="464" height="384" rx="38" fill="#eafaf1" />
      <rect x="8" y="8" width="464" height="384" rx="38" fill="url(#hero-sky)" opacity={0.9} />
      <g clipPath="url(#hero-clip)">
        <StarPattern />
        <Cloud x={34} y={62} s={0.9} />
        <Cloud x={330} y={40} s={0.66} />
        <circle cx={406} cy={78} r={21} fill={GOLD} />

        {/* mosque skyline */}
        <g opacity={0.85}>
          <path d="M186 236 Q240 170 294 236 Z" fill={GREEN} opacity={0.32} />
          <path d="M240 174 L244 157 L248 174 Z" fill={GOLD_DARK} opacity={0.55} />
          <rect x={148} y={196} width={18} height={40} rx={9} fill={GREEN} opacity={0.28} />
          <rect x={314} y={196} width={18} height={40} rx={9} fill={GREEN} opacity={0.28} />
          <rect x={92} y={234} width={296} height={8} rx={4} fill={GREEN_SOFT} opacity={0.5} />
        </g>

        {/* rug */}
        <ellipse cx={240} cy={336} rx={200} ry={48} fill={GREEN_SOFT} opacity={0.45} />
        <ellipse cx={240} cy={336} rx={152} ry={34} fill={CREAM} opacity={0.7} />

        {/* one child per age band, each holding their own mushaf */}
        <Kid x={104} y={344} age="paud" gender="girl" outfit="#fda4af" accent="#be123c" skin={SKIN[0]} s={1.02} happy facing={1} holding="book" />
        <Kid x={238} y={368} age="tk" gender="boy" outfit="#fbbf24" accent="#b45309" skin={SKIN[1]} s={1.12} facing={1} holding="book" />
        <Kid x={372} y={352} age="tpa" gender="girl" outfit="#8b5cf6" accent="#6d28d9" skin={SKIN[2]} s={1.2} facing={-1} holding="book" />

        <Sparkle x={104} y={198} s={1.2} />
        <Sparkle x={398} y={214} s={0.9} fill={PINK} />
        <Sparkle x={62} y={286} s={0.8} fill={PURPLE} />
      </g>
    </svg>
  );
}

/** PAUD (3–4): toddler stacking hijaiyah letter blocks. */
export function PaudScene() {
  return (
    <svg className="h-auto w-full" viewBox="0 0 320 260" role="img" aria-label="Anak PAUD bermain balok huruf hijaiyah">
      <defs>
        <linearGradient id="paud-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#d7f2e4" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" rx="24" fill="url(#paud-bg)" />
      <circle cx={268} cy={48} r={17} fill={GOLD} opacity={0.9} />
      <ellipse cx={160} cy={228} rx={128} ry={24} fill={GREEN_SOFT} opacity={0.45} />
      <Kid x={112} y={218} age="paud" gender="girl" outfit="#fda4af" accent="#be123c" skin={SKIN[0]} s={1.26} happy facing={1} holding="block" />
      <HijaiyahBlock x={206} y={212} fill="#f59e0b" letter="ت" s={1} />
      <HijaiyahBlock x={252} y={216} fill="#10b981" letter="ج" s={0.92} />
      <Sparkle x={272} y={130} s={1} />
      <Sparkle x={56} y={114} s={0.8} fill={PINK} />
    </svg>
  );
}

/** TK (5–6): coloring a mosque outline at a low table. */
export function TkScene() {
  return (
    <svg className="h-auto w-full" viewBox="0 0 320 260" role="img" aria-label="Anak TK mewarnai gambar masjid">
      <defs>
        <linearGradient id="tk-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d7f2e4" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" rx="24" fill="url(#tk-bg)" />
      <ellipse cx={160} cy={230} rx={130} ry={24} fill={GREEN_SOFT} opacity={0.4} />

      {/* colouring sheet on the mat */}
      <g transform="translate(236 206) rotate(-7)">
        <rect x={-38} y={-28} width={76} height={56} rx={5} fill="#ffffff" stroke="#e2e8f0" strokeWidth={2} />
        <path d="M-15 10 Q0 -12 15 10 Z" fill="none" stroke="#8f9bab" strokeWidth={2.4} />
        <rect x={-18} y={10} width={36} height={12} rx={2} fill="none" stroke="#8f9bab" strokeWidth={2.4} />
        <path d="M-26 -16 L-18 -4" stroke="#f472b6" strokeWidth={3.4} strokeLinecap="round" opacity={0.75} />
      </g>

      <Kid x={120} y={222} age="tk" gender="boy" outfit="#fbbf24" accent="#b45309" skin={SKIN[1]} s={1.34} happy facing={0} holding="book" />

      <Crayon x={196} y={222} rot={-28} color="#22c55e" />
      <Crayon x={214} y={230} rot={12} color="#3b82f6" />
      <Sparkle x={46} y={90} s={1} />
      <Sparkle x={282} y={62} s={0.85} fill={PINK} />
    </svg>
  );
}

export function TpaScene() {
  return (
    <svg className="h-auto w-full" viewBox="0 0 320 260" role="img" aria-label="Santri TPA membaca Al-Qur'an">
      <defs>
        <linearGradient id="tpa-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ede9fe" />
          <stop offset="1" stopColor="#d7f2e4" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" rx="24" fill="url(#tpa-bg)" />
      <ellipse cx={160} cy={232} rx={132} ry={22} fill={GREEN_SOFT} opacity={0.4} />

      <g opacity={0.9}>
        <rect x={34} y={54} width={110} height={7} rx={3.5} fill="#d9cfbb" />
        <rect x={42} y={34} width={12} height={20} rx={2} fill={GREEN} />
        <rect x={58} y={30} width={12} height={24} rx={2} fill={GOLD_DARK} />
        <rect x={74} y={36} width={12} height={18} rx={2} fill={PURPLE} />
        <rect x={90} y={32} width={12} height={22} rx={2} fill="#38bdf8" />
      </g>

      <Kid x={168} y={226} age="tpa" gender="girl" outfit="#8b5cf6" accent="#6d28d9" skin={SKIN[2]} s={1.34} facing={0} holding="book" />
      <Sparkle x={264} y={92} s={1.1} />
      <Sparkle x={62} y={132} s={0.8} fill={PINK} />
      <circle cx={272} cy={40} r={15} fill={GOLD} opacity={0.85} />
    </svg>
  );
}

export type SceneKey = "hero" | "paud" | "tk" | "tpa";

export function Scene({ name }: { name: SceneKey }) {
  if (name === "paud") return <PaudScene />;
  if (name === "tk") return <TkScene />;
  if (name === "tpa") return <TpaScene />;
  return <HeroScene />;
}

/** Compact hero used by localized landing pages. */
export function LandingHeroScene({ lang }: { lang: "id" | "en" }) {
  void lang;
  return <HeroScene />;
}
