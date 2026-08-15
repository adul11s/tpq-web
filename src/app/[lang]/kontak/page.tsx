import type { Metadata } from "next";
import { InquiryForm } from "@/components/landing/InquiryForm";
import { fetchClasses } from "@/lib/data/classes";
import { fetchSiteSettings } from "@/lib/data/pages";
import { isLang, pick, type Lang } from "@/lib/lang";
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

export default async function KontakPage({ params }: KontakPageProps) {
  const { lang: langParam } = await params;
  const lang: Lang = isLang(langParam) ? langParam : "id";
  const [classes, settings] = await Promise.all([
    fetchClasses(),
    fetchSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
        {pick(lang, "Kontak & Pendaftaran", "Contact & Enrollment")}
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        {pick(
          lang,
          "Isi formulir di bawah atau hubungi kami langsung. Tim kami akan menindaklanjuti pertanyaan Anda.",
          "Fill in the form below or contact us directly. Our team will follow up on your inquiry.",
        )}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <InquiryForm
            lang={lang}
            classes={classes}
            privacyPolicyVersion={settings.privacyPolicyVersion}
            privacyPolicyPath={settings.privacyPolicyUrl}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              {pick(lang, "Informasi Kontak", "Contact Information")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>{settings.address}</li>
              <li>{settings.phone}</li>
              <li>{settings.hours}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-bold text-emerald-900">
              {pick(lang, "Lebih cepat? Chat WhatsApp", "Faster? Chat on WhatsApp")}
            </h2>
            <p className="mt-2 text-sm text-emerald-800">
              {pick(
                lang,
                "Klik tombol di bawah untuk langsung terhubung dengan admin kami.",
                "Click the button below to connect directly with our admin.",
              )}
            </p>
            <a
              href={waLink(settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {pick(lang, "Chat WhatsApp", "Chat on WhatsApp")}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
