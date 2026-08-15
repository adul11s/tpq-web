import type { Page } from "@/lib/types/page";
import type { SiteSettings } from "@/lib/types/siteSettings";

export const mockSiteSettings: SiteSettings = {
  address: "Jl. Pendidikan Islam No. 1, Kota Contoh",
  mapLink: "https://maps.example.id/tpq-qurani",
  phone: "0812-3456-7890",
  whatsapp: "6281234567890",
  hours: "Senin–Sabtu, 07.30–16.30 WIB",
  facebook: "https://facebook.com/tpqqurani",
  instagram: "https://instagram.com/tpqqurani",
  privacyPolicyUrl: "/privacy-policy",
  privacyPolicyVersion: "1.0",
};

export const mockPages: Page[] = [
  {
    slug: "home",
    titleId: "TPQ Qur'ani — PAUD/TK/TPA Qur'ani",
    titleEn: "TPQ Qur'ani — Qur'ani Early Education",
    contentId: [
      {
        id: "hero",
        type: "hero",
        heading: "Membentuk generasi cinta Al-Qur'an sejak dini",
        text: "Tempat anak-anak belajar membaca Al-Qur'an, menghafal doa harian, dan tumbuh dengan akhlak Islami. Lengkapi pembelajaran di rumah melalui pusat materi unduhan kami.",
        ctaLabel: "Lihat Program Kelas",
        ctaHref: "/kelas",
        ctaSecondaryLabel: "Jelajahi Materi Unduhan",
        ctaSecondaryHref: "/resources",
      },
      {
        id: "sections-intro",
        type: "heading",
        heading: "Program Kelas Kami",
      },
      {
        id: "sections-body",
        type: "paragraph",
        text: "Tiga jenjang pendidikan Qur'ani yang disesuaikan dengan usia dan tahap perkembangan anak.",
      },
      {
        id: "cta",
        type: "cta",
        heading: "Siap Mendaftarkan Buah Hati?",
        text: "Hubungi kami melalui WhatsApp untuk konsultasi program dan pendaftaran. Kuota terbatas setiap tahun ajaran.",
        ctaLabel: "Chat WhatsApp",
        ctaHref: "https://wa.me/6281234567890?text=Assalamu%27alaikum%2C%20saya%20ingin%20bertanya%20tentang%20pendaftaran%20TPQ%20Qur%27ani",
      },
    ],
    contentEn: [
      {
        id: "hero",
        type: "hero",
        heading: "Raising a generation that loves the Qur'an",
        text: "Where children learn to read the Qur'an, memorize daily prayers, and grow with Islamic character. Continue learning at home through our downloadable resource center.",
        ctaLabel: "View Programs",
        ctaHref: "/kelas",
        ctaSecondaryLabel: "Explore Downloads",
        ctaSecondaryHref: "/resources",
      },
      {
        id: "sections-intro",
        type: "heading",
        heading: "Our Programs",
      },
      {
        id: "sections-body",
        type: "paragraph",
        text: "Three Qur'ani education levels adapted to each child's age and development stage.",
      },
      {
        id: "cta",
        type: "cta",
        heading: "Ready to Enroll Your Child?",
        text: "Contact us on WhatsApp to discuss programs and enrollment. Places are limited each academic year.",
        ctaLabel: "Chat on WhatsApp",
        ctaHref: "https://wa.me/6281234567890?text=Assalamu%27alaikum%2C%20saya%20ingin%20bertanya%20tentang%20pendaftaran%20TPQ%20Qur%27ani",
      },
    ],
    seoTitleId: "TPQ Qur'ani — PAUD/TK/TPA Qur'ani",
    seoTitleEn: "TPQ Qur'ani — Qur'ani Early Education School",
    seoDescriptionId:
      "PAUD, TK, dan TPA Qur'ani: belajar Al-Qur'an, doa harian, dan akhlak Islami. Unduh materi pembelajaran untuk anak di rumah.",
    seoDescriptionEn:
      "Qur'ani early education: learn the Qur'an, daily prayers, and Islamic character. Download learning materials for home.",
    heroMediaUrl: null,
    status: "published",
    publishedAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-10T00:00:00Z",
  },
  {
    slug: "privacy-policy",
    titleId: "Kebijakan Privasi",
    titleEn: "Privacy Policy",
    contentId: [
      {
        id: "intro",
        type: "paragraph",
        text: "TPQ Qur'ani menghormati privasi Anda. Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa, berapa lama kami menyimpannya, dan bagaimana Anda dapat mengajukan permintaan penghapusan data.",
      },
      {
        id: "collected",
        type: "heading",
        heading: "Data yang Kami Kumpulkan",
      },
      {
        id: "collected-list",
        type: "list",
        items: [
          "Nama orang tua dan nomor HP/WhatsApp saat mengisi formulir pendaftaran.",
          "Usia anak dan program yang diminati.",
          "Data analitik anonim (halaman yang dikunjungi, materi yang diunduh) melalui Google Analytics 4.",
          "Alamat IP dalam bentuk hash untuk pencegahan spam.",
        ],
      },
      {
        id: "purpose",
        type: "heading",
        heading: "Tujuan Penggunaan",
      },
      {
        id: "purpose-list",
        type: "list",
        items: [
          "Menindaklanjuti pertanyaan dan pendaftaran melalui telepon atau WhatsApp.",
          "Mengukur penggunaan materi unduhan untuk perbaikan layanan.",
        ],
      },
      {
        id: "retention",
        type: "heading",
        heading: "Lama Penyimpanan",
      },
      {
        id: "retention-list",
        type: "list",
        items: [
          "Data pendaftaran dianonimkan 24 bulan setelah status pengajuan ditutup.",
          "Catatan unduhan dihapus setelah 12 bulan.",
        ],
      },
      {
        id: "rights",
        type: "heading",
        heading: "Hak Anda",
      },
      {
        id: "rights-text",
        type: "paragraph",
        text: "Anda berhak meminta akses, koreksi, atau penghapusan data pribadi Anda. Hubungi kami melalui WhatsApp 0812-3456-7890 atau email privasi@tpq-qurani.example.id.",
      },
    ],
    contentEn: [
      {
        id: "intro",
        type: "paragraph",
        text: "TPQ Qur'ani respects your privacy. This policy explains what data we collect, why, how long we keep it, and how to request deletion.",
      },
      {
        id: "collected",
        type: "heading",
        heading: "Data We Collect",
      },
      {
        id: "collected-list",
        type: "list",
        items: [
          "Parent name and phone/WhatsApp number when submitting the enrollment form.",
          "Child age and program of interest.",
          "Anonymous analytics data (pages visited, materials downloaded) via Google Analytics 4.",
          "Hashed IP addresses for spam prevention.",
        ],
      },
      {
        id: "purpose",
        type: "heading",
        heading: "Purpose of Use",
      },
      {
        id: "purpose-list",
        type: "list",
        items: [
          "Following up inquiries and enrollments by phone or WhatsApp.",
          "Measuring download usage to improve our services.",
        ],
      },
      {
        id: "retention",
        type: "heading",
        heading: "Retention Period",
      },
      {
        id: "retention-list",
        type: "list",
        items: [
          "Inquiry data is anonymized 24 months after the inquiry is closed.",
          "Download event logs are deleted after 12 months.",
        ],
      },
      {
        id: "rights",
        type: "heading",
        heading: "Your Rights",
      },
      {
        id: "rights-text",
        type: "paragraph",
        text: "You may request access, correction, or deletion of your personal data. Contact us on WhatsApp 0812-3456-7890 or email privacy@tpq-qurani.example.id.",
      },
    ],
    seoTitleId: null,
    seoTitleEn: null,
    seoDescriptionId: null,
    seoDescriptionEn: null,
    heroMediaUrl: null,
    status: "published",
    publishedAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
];
