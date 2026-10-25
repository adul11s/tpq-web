import Image from "next/image";

/**
 * Photographic scenes for TPQ Qur'ani.
 *
 * These replace the earlier hand-drawn SVG scenes (Scenes.tsx) so the site shows
 * real classrooms instead of illustration. Every photo is licence-safe (Pexels
 * licence) and cropped to the exact aspect ratio of its slot; sources, credits
 * and dimensions live in `docs/media/image-provenance.md`.
 *
 * Deliberate editorial rule: no child's face is the front-and-centre subject.
 * Parents are the audience, so the photos show hands on books, children from
 * behind, and classroom activity rather than identifiable portraits.
 */

export type SceneKey = "hero" | "paud" | "tk" | "tpa";

const SCENE_SRC: Record<SceneKey, string> = {
  hero: "/images/hero.jpg",
  paud: "/images/paud.jpg",
  tk: "/images/tk.jpg",
  tpa: "/images/tpa.jpg",
};

const SCENE_ALT: Record<SceneKey, string> = {
  hero: "Santri membaca Al-Qur'an di kelas TPQ",
  paud: "Anak PAUD bermain balok kayu warna-warni",
  tk: "Kegiatan mewarnai kelas TK bersama guru",
  tpa: "Santri TPA membaca Al-Qur'an bersama",
};

/** Hero photo: 6:5 slot, floats two badges over it. */
export function HeroPhoto() {
  return (
    <div className="relative aspect-[6/5] w-full overflow-hidden rounded-[2rem] border border-mint-100 bg-mint-50 shadow-lg">
      <Image
        src={SCENE_SRC.hero}
        alt={SCENE_ALT.hero}
        fill
        priority
        sizes="(min-width: 1024px) 34rem, 100vw"
        className="object-cover"
      />
    </div>
  );
}

/** Class photo used in cards, tabs and the class detail page. */
export function ClassPhoto({ name, sizes = "(min-width: 1024px) 33vw, 100vw" }: { name: SceneKey; sizes?: string }) {
  return (
    <Image
      src={SCENE_SRC[name]}
      alt={SCENE_ALT[name]}
      fill
      sizes={sizes}
      className="object-cover"
      loading="lazy"
    />
  );
}
