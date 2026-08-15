import type { Lang } from "@/lib/lang";

interface SkipLinkProps {
  lang: Lang;
}

export function SkipLink({ lang }: SkipLinkProps) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-mint-700 focus:px-4 focus:py-3 focus:text-white focus:shadow-lift"
    >
      {lang === "en" ? "Skip to main content" : "Lewati ke konten utama"}
    </a>
  );
}