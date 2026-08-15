interface HeroProps {
  heading: string;
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}

export function Hero({
  heading,
  text,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-800">
            PAUD • TK • TPA Qur&rsquo;ani
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {heading}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            {text}
          </p>
          {ctaLabel && ctaHref ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {ctaLabel ? (
                <a
                  href={ctaHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  {ctaLabel}
                </a>
              ) : null}
              {ctaSecondaryLabel && ctaSecondaryHref ? (
                <a
                  href={ctaSecondaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600 px-6 py-3 text-base font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  {ctaSecondaryLabel}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
