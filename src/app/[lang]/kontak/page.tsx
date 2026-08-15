import type { Metadata } from "next";
import { InquiryForm } from "@/components/landing/InquiryForm";
import { fetchClasses } from "@/lib/data/classes";
import { fetchSiteSettings } from "@/lib/data/pages";
import { isLang, type Lang } from "@/lib/lang";
import { waLink } from "@/lib/wa";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 600;

interface KontakPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: KontakPageProps): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  return buildMetadata({
    lang,
    path: "/kontak",
    titleId: "Kontak & Pendaftaran",
    titleEn: "Contact & Enrollment",
    descriptionId:
      "Hubungi TPQ Qur'ani untuk konsultasi program dan pendaftaran PAUD, TK, dan TPA.",
    descriptionEn:
      "Contact TPQ Qur'ani for program consultation and PAUD, TK, and TPA enrollment.",
  });
}

function PinIcon() {
  return (
    <svg className="h-5 w-5 text-mint-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5 text-mint-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5 text-mint-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-1.5-.5 12 12 0 0 1-4.4-3.9 5 5 0 0 1-1-2.7c0-1.2.6-1.8 1-2.2l.5-.5c.2-.2.4-.2.6-.2h.4c.2 0 .4-.1.6.4l.8 1.9c.1.2.1.4 0 .6l-.3.5-.5.5c-.2.2-.3.4-.2.7.2.3.8 1.3 1.6 2.1 1.1 1 2 1.4 2.4 1.5.3.2.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2 1c.3.1.5.2.5.4.1.3.1.8-.2 1.3Z" />
    </svg>
  );
}

export default async function KontakPage({ params }: KontakPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const [classes, settings] = await Promise.all([
    fetchClasses(),
    fetchSiteSettings(),
  ]);

  const infoTiles = [
    { icon: <PinIcon />, label: settings.address },
    { icon: <PhoneIcon />, label: settings.phone },
    { icon: <ClockIcon />, label: settings.hours },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-mint-50 via-cream to-gold-50">
        <div className="star-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="orb animate-floaty -right-24 -top-24 h-72 w-72 bg-gold-100" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 text-center sm:px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white/80 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-mint-700 shadow-sm">
            {lang === "en" ? "Contact & Enrollment" : "Kontak & Pendaftaran"}
          </p>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-mint-900 sm:text-5xl">
            {lang === "en" ? (
              <>Let&rsquo;s <span className="text-gold-600">Get Acquainted!</span></>
            ) : (
              <>Yuk, <span className="text-gold-600">Kenalan Dulu!</span></>
            )}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mint-900/70">
            {lang === "en"
              ? "Ask us anything about programs, schedules, or fees — our team replies within 24 hours at the latest."
              : "Tanyakan apa saja tentang program, jadwal, atau biaya — tim kami siap menjawab dalam maksimal 24 jam."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-mint-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <h2 className="font-display text-xl font-extrabold text-mint-900">
              {lang === "en" ? "Ask a Question" : "Formulir Pertanyaan"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-mint-800/70">
              {lang === "en"
                ? "Fill in your details below and we will get back to you."
                : "Isi data di bawah, kami akan menghubungi Anda kembali."}
            </p>
            <div className="mt-6">
              <InquiryForm
                lang={lang}
                classes={classes}
                privacyPolicyVersion={settings.privacyPolicyVersion}
                privacyPolicyPath={settings.privacyPolicyUrl}
              />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-mint-100 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-extrabold text-mint-900">
                {lang === "en" ? "Contact Info" : "Info Kontak"}
              </h2>
              <ul className="mt-4 space-y-4">
                {infoTiles.map((tile, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-100">
                      {tile.icon}
                    </span>
                    <span className="pt-2 text-sm font-semibold leading-relaxed text-mint-900/80">
                      {tile.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-3xl border border-mint-100 bg-white shadow-sm">
              <h2 className="px-6 pt-6 font-display text-lg font-extrabold text-mint-900">
                {lang === "en" ? "Our Location" : "Lokasi Kami"}
              </h2>
              {settings.mapLink ? (
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 block"
                >
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-mint-100 via-cream to-gold-100">
                    <svg
                      className="h-12 w-12 text-mint-400 transition-transform group-hover:scale-110"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span className="sr-only">
                      {lang === "en" ? "Open map location" : "Buka lokasi di peta"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-6 py-4">
                    <p className="text-center text-xs font-bold text-mint-800/60">
                      {lang === "en"
                        ? "Interactive map will be embedded here (Google Maps)"
                        : "Peta interaktif akan dipasang di sini (Google Maps embed)"}
                    </p>
                  </div>
                </a>
              ) : (
                <div className="mt-4 block">
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-mint-100 via-cream to-gold-100">
                    <svg
                      className="h-12 w-12 text-mint-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-6 py-4">
                    <p className="text-center text-xs font-bold text-mint-800/60">
                      {lang === "en"
                        ? "Interactive map will be embedded here (Google Maps)"
                        : "Peta interaktif akan dipasang di sini (Google Maps embed)"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-gold-500 p-6 text-center shadow-lg shadow-gold-500/30">
              <h2 className="font-display text-lg font-extrabold text-on-accent">
                {lang === "en"
                  ? "Chat Directly via WhatsApp"
                  : "Chat Langsung via WhatsApp"}
              </h2>
              <a
                href={waLink(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-mint-950 px-7 py-3 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-mint-900"
              >
                <WhatsAppIcon />
                {lang === "en" ? "Chat on WhatsApp" : "Chat WhatsApp"}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
