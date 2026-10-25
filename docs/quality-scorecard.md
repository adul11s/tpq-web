# Quality Scorecard — tpq-web (TPQ Qur'ani Frontend)

Rubrik 8 dimensi berbobot, sama seperti repo portfolio lain. Semua angka diambil dari
pengukuran nyata pada 2026-10-25, bukan estimasi.

| Dimensi | Bobot | Skor | Bukti |
|---|---|---|---|
| Narasi masalah | 10% | 9 | README menjelaskan target pengguna (PAUD/TK/TPA, orang tua, content manager) dan ruang lingkup. PRD lengkap ada di repo dokumen: [PRD-Qurani-Website.md](https://github.com/adul11s/tpq-docs/blob/main/product/PRD-Qurani-Website.md) |
| Demo & reproduksibilitas | 15% | 9 | **Live: https://tpq-qurani-portfolio.vercel.app** (HTTP 200, dicek 2026-10-25), login admin demo tersedia. `npm install && npm run dev` jalan tanpa backend karena ada **mock-data mode** (`src/lib/mock/`). Tidak 10: tanpa video/GIF dan build SSG butuh API hidup |
| Kebenaran & test | 20% | 10 | **49 file test, 316 test hijau** (`npx vitest run`, 2026-10-25) + Playwright e2e suite; CI hijau ([run 39582874046](https://github.com/adul11s/tpq-web/actions/runs/39582874046)) menjalankan content-script policy → lint → test → build; `strict: true` di tsconfig |
| Arsitektur & keputusan | 15% | 9 | Lapisan jelas: `lib/api` (client bertipe), `lib/data` (data-access, fallback mock), `hooks/`, route group `[lang]`; proxy same-origin `src/app/api/admin/[...route]` dan `parent` untuk cookie first-party. Keputusan ditulis di [`docs/adr/`](docs/adr/) |
| Keamanan | 10% | 9 | Session HttpOnly server-managed, CSRF + origin check, 2FA (TOTP + backup code), RBAC `admin` vs `content_manager` terdokumentasi matriks rute, audit log + export CSV, kebijakan konten statis bebas script yang ditegakkan CI. Model ancaman lengkap di repo dokumen: [SECURITY.md](https://github.com/adul11s/tpq-docs/blob/main/security/SECURITY.md) |
| Operasional | 10% | 8 | Deploy Vercel + revalidate webhook (`POST /api/revalidate`), GA4 events, health API terpisah. Belum ada metrics/alerting/runbook frontend |
| Kerapian kode | 10% | 9 | `strict: true`, ESLint bersih, `check:content` menjaga aset statis, struktur folder konsisten per domain. Belum ada formatter yang ditegakkan CI |
| Presentasi | 10% | 8 | README sangat lengkap (live table, gotchas, role matrix, QA mapping C1–C11, env table) + 4 user guide di repo dokumen. Belum ada video/GIF |

**Total:** 8.9
**Kenapa bukan 10:** tidak ada video demo; e2e Playwright belum dijalankan di CI; operasional belum punya metrics/alert.
**Kenapa bukan lebih rendah:** 316 test dengan mock network (bukan snapshot), CI menjaga 4 gerbang sekaligus, dan tidak ada klaim di README yang tidak bisa dilacak ke kode.
**Target berikutnya:** jalankan e2e di CI (headless, artefak video) → demo & kebenaran naik; tambah 1 run Lighthouse → operasional 9.
**Tanggal review:** 2026-10-25
