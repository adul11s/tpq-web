import Image from "next/image";
import type { ResourceCategorySlug } from "@/lib/types/api";

/**
 * Category thumbnails for the Resource Dashboard.
 *
 * Replaces the previous gradient+glyph SVG motif. Photos are local, 4:3 and
 * licence-safe; provenance in `docs/media/image-provenance.md`. No faces: these
 * are hands, tools and books.
 */

const CATEGORY_SRC: Record<ResourceCategorySlug, { src: string; alt: string }> = {
  prayers: {
    src: "/images/prayers.jpg",
    alt: "Tasbih dan mushaf di pangkuan",
  },
  calligraphy: {
    src: "/images/calligraphy.jpg",
    alt: "Menulis kaligrafi dengan pena dan tinta",
  },
  coloring: {
    src: "/images/coloring.jpg",
    alt: "Pensil warna untuk lembar mewarnai",
  },
  readings: {
    src: "/images/readings.jpg",
    alt: "Mushaf terbuka di atas rehal",
  },
  documents: {
    src: "/images/documents.jpg",
    alt: "Anak menulis di lembar latihan",
  },
};

interface CategoryIllustrationProps {
  category: ResourceCategorySlug;
  /** Optional per-resource seed (usually the slug) so two cards in the same
   *  category do not show an identical crop of the same photo. */
  seed?: string;
}

const POSITIONS = ["center", "top", "left", "right", "bottom"] as const;

function positionFor(seed?: string) {
  if (!seed) return "center";
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  return POSITIONS[hash % POSITIONS.length];
}

export function CategoryIllustration({ category, seed }: CategoryIllustrationProps) {
  const motif = CATEGORY_SRC[category] ?? CATEGORY_SRC.documents;

  return (
    <Image
      src={motif.src}
      alt={motif.alt}
      fill
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      style={{ objectPosition: positionFor(seed) }}
      loading="lazy"
    />
  );
}
