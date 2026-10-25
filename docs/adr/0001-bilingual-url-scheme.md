# ADR 0001 — Bilingual URL scheme dengan `[lang]` segment + rewrite `/` → `/id`

- **Status:** Accepted (berlaku di kode saat ini)
- **Tanggal:** 2026-10-25 (dicatat ulang dari keputusan yang sudah jalan)
- **Konteks:** Situs perlu dua bahasa (ID default, EN), SEO harus punya URL
  kanonik + `hreflang` per bahasa, dan CMS hanya mengelola satu set konten per
  entitas (field ID + EN), bukan dua pohon halaman.

## Keputusan

1. Semua halaman publik hidup di dalam route group `src/app/[lang]/...` dengan
   `lang ∈ {id, en}`.
2. `/` **di-rewrite** ke `/id` oleh `src/proxy.ts` (bukan redirect), supaya URL
   pendek tetap bekerja tanpa kehilangan path asli di address bar.
3. Terjemahan diambil per-field lewat helper `pick()` di `src/lib/lang.ts`, dengan
   fallback ke bahasa default kalau field EN kosong.
4. `sitemap.ts` hanya memuat entitas yang sudah published, dengan alternates
   `hreflang` untuk `id` dan `en`.

## Konsekuensi

- Positif: satu pohon route, satu sumber konten, `hreflang` akurat, tidak ada
  duplikasi halaman per bahasa; tidak perlu library i18n runtime.
- Negatif: setiap halaman wajib menerima `params.lang`; konten yang belum
  diterjemahkan tampil campur (ID fallback) — itu keputusan sadar, bukan bug.
- `/admin` dan `/api` di-exclude dari rewrite, jadi area admin tidak pernah
  bilingual.

## Alternatif yang ditolak

- **Library i18n (next-intl) dengan dua file pesan:** tidak cocok karena konten
  berasal dari CMS, bukan dari katalog string statis.
- **Subdomain `en.`:** menambah beban DNS/TLS dan memecah cookie sesi admin.

## Bukti di kode

`src/proxy.ts`, `src/lib/lang.ts`, `src/app/[lang]/`, `src/app/sitemap.ts`,
`tests/proxy.test.ts`.
