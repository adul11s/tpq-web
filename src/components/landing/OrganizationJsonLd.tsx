import { SITE_URL } from "@/lib/seo";
import type { SiteSettings } from "@/lib/types/siteSettings";

interface OrganizationJsonLdProps {
  settings: SiteSettings;
}

export function OrganizationJsonLd({ settings }: OrganizationJsonLdProps) {
  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    name: "TPQ Qur'ani",
    url: SITE_URL,
    description:
      "PAUD, TK, dan TPA Qur'ani: belajar Al-Qur'an, doa harian, dan akhlak Islami.",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
    },
    telephone: settings.phone,
    sameAs: [settings.facebook, settings.instagram].filter(
      (value): value is string => Boolean(value),
    ),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
    />
  );
}
