import { Hero } from "@/components/landing/Hero";
import { Button } from "@/components/ui/Button";
import { localizedHref, type Lang } from "@/lib/lang";
import type { PageBlock } from "@/lib/types/page";

function localizeHref(lang: Lang, href: string | undefined): string | undefined {
  if (!href) {
    return undefined;
  }
  return href.startsWith("http") ? href : localizedHref(lang, href);
}

interface PageContentProps {
  blocks: PageBlock[];
  lang: Lang;
  allowedTypes?: PageBlock["type"][];
}

export function PageContent({
  blocks,
  lang,
  allowedTypes,
}: PageContentProps) {
  const visible = allowedTypes
    ? blocks.filter((block) => allowedTypes.includes(block.type))
    : blocks;

  return (
    <>
      {visible.map((block) => {
        switch (block.type) {
          case "hero":
            return <Hero key={block.id} lang={lang} />;
          case "heading":
            return (
              <h2
                key={block.id}
                className="text-2xl font-bold text-slate-900 sm:text-3xl"
              >
                {block.heading}
              </h2>
            );
          case "paragraph":
            return (
              <p
                key={block.id}
                className="max-w-2xl text-slate-600"
              >
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul
                key={block.id}
                className="list-disc space-y-1.5 pl-5 text-slate-600"
              >
                {block.items?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            );
          case "html":
            return block.html ? (
              <div
                key={block.id}
                className="prose prose-slate max-w-none text-slate-600 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-slate-900 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_a]:text-emerald-700 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            ) : null;
          case "cta":
            return (
              <section
                key={block.id}
                className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6"
              >
                {block.heading ? (
                  <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {block.heading}
                  </h2>
                ) : null}
                {block.text ? (
                  <p className="mx-auto mt-3 max-w-xl text-slate-600">
                    {block.text}
                  </p>
                ) : null}
                {block.ctaLabel && block.ctaHref ? (
                  <div className="mt-6 flex justify-center gap-3">
                    <Button
                      href={localizeHref(lang, block.ctaHref)}
                      size="lg"
                      target={
                        block.ctaHref.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        block.ctaHref.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {block.ctaLabel}
                    </Button>
                    {block.ctaSecondaryLabel && block.ctaSecondaryHref ? (
                      <Button
                        href={localizeHref(lang, block.ctaSecondaryHref)}
                        size="lg"
                        variant="outline"
                      >
                        {block.ctaSecondaryLabel}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
