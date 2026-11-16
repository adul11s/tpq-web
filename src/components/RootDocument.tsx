import type { Metadata } from "next";
import { Amiri, Baloo_2, Nunito } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";
import { SITE_NAME } from "@/lib/seo";
import type { Lang } from "@/lib/lang";

const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "PAUD, TK, dan TPA Qur'ani: belajar Al-Qur'an, doa harian, dan akhlak Islami. Unduh materi pembelajaran untuk anak di rumah.",
};

export function RootDocument({ children, lang }: { children: React.ReactNode; lang: Lang }) {
  return (
    <html
      lang={lang}
      className={`${baloo.variable} ${nunito.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
