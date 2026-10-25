# TPQ Qur'ani — Web Frontend

[![CI](https://github.com/adul11s/tpq-web/actions/workflows/ci.yml/badge.svg)](https://github.com/adul11s/tpq-web/actions/workflows/ci.yml)
[![Uptime](https://github.com/adul11s/tpq-web/actions/workflows/uptime.yml/badge.svg)](https://github.com/adul11s/tpq-web/actions/workflows/uptime.yml)

Public website for PAUD/TK/TPA Qur'ani: landing pages (class profiles), a
Resource Dashboard (downloadable materials: prayers, readings, coloring,
calligraphy), bilingual routing (`/` = ID, `/en/` = EN), and an enrollment
inquiry form. Built with **Next.js (App Router) + React 19 + TypeScript +
Tailwind CSS**, aligned with [`System-Analyst-Design.md`](https://github.com/adul11s/tpq-docs/blob/main/design/System-Analyst-Design.md) v1.2 and
[`SA-Dev-Handoff.md`](https://github.com/adul11s/tpq-docs/blob/main/design/SA-Dev-Handoff.md) v1.2.

## Live deployment

| Piece | Where |
|---|---|
| Site (this repo) | https://tpq-qurani-portfolio.vercel.app — Vercel Hobby (Next.js) |
| API | https://tpq-api.onrender.com — Render Free, built from `Dockerfile` (Oregon) |
| Database | Neon Postgres (serverless, `DATABASE_URL`) |
| Cache / rate limit | Upstash Redis (`rediss://`, `REDIS_URL`) |
| Media | Cloudflare R2 bucket `tpq-media` — public `r2.dev` origin (pinned in `next.config.ts`) |

Notes:

- The API **sleeps after ~15 min of idle** — the first visitor request wakes it
  (~30–60 s); subsequent requests are fast.
- Authenticated admin/parent traffic flows through the same-origin Next.js
  proxies `/api/admin/*` and `/api/parent/*` (session + CSRF cookies are
  first-party). Public catalog reads call the API directly (CORS,
  `CORS_ORIGIN` on the API = this site's origin).
- Demo admin login: `admin@tpq.id` / `admin123` — **seed/demo data only**;
  disable or rotate before any real use (`NEXT_PUBLIC_DEV_CREDENTIALS=false`
  hides it from the UI).
- Deployment mechanics for the API (env, migrations, smoke) live in
  `../api/DEPLOY.md`.

## Demo (video)

![Demo — situs publik ID/EN + CMS admin](docs/media/demo.gif)

Rekaman 80 detik dari deployment live: halaman publik (ID + EN), Resource
Dashboard, lalu login admin → dashboard → Konten → Inquiry → Aktivitas. Versi
penuh dengan audio-free 1280×720: [`docs/media/demo.mp4`](docs/media/demo.mp4)
(1,4 MB). GIF di atas adalah 42 detik pertama (3 MB).

Direkam otomatis, bukan manual: `node scripts/demo-video.mjs` membuka
`PLAYWRIGHT_BASE_URL` (default: URL live di atas) dengan Chromium, menggerakkan
kursor asli + ripple klik, dan menyimpan rekaman ke `docs/media/`. Login demo
yang dipakai ada di tabel deployment di atas (data seed, bukan data sekolah).

## Uptime

`.github/workflows/uptime.yml` memeriksa tiap 6 jam: `GET /health` di API
(memberi toleransi cold start Render sampai 120 detik + 3 retry), lalu `/id`,
`/en`, `/id/resources`, `sitemap.xml`, dan `/admin/login`. Run merah = alarm.
Badge Uptime di atas menampilkan status pemeriksaan terakhir.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without a backend, the app runs in **mock-data mode** (`src/lib/mock/`).
Point it at the real API by copying `.env.example` to `.env.local` and setting
`NEXT_PUBLIC_API_BASE_URL`.

### Full dev stack (recommended)

The repo root has `../dev.sh` — one command boots Postgres + Redis + MinIO +
API (:3100) + web (:3000), seeds/creates config, and prints URLs + demo
credentials. Otherwise: start the API repo (`../api`) on :3100 first (it must
be reachable at build time), then:

```bash
cp .env.example .env.local   # then set NEXT_PUBLIC_API_BASE_URL=http://localhost:3100/api/v1
npm run build && npm run start   # or npm run dev
```

**Gotchas**
- Stale `next start` processes on :3000 serve memory-cached OLD builds — kill
  them (`lsof -ti :3000 | xargs kill -9`) before starting a fresh one.
- Admin demo login: `admin@tpq.id` / `admin123` (2FA is OFF by default —
  `REQUIRE_2FA=0`; the login page has a one-click demo fill when
  `NEXT_PUBLIC_DEV_CREDENTIALS=true`).
  ⚠️ **Demo credentials are for the public portfolio demo only** — the
  deployed database contains seed/demo data only, never real school records.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest suite (jsdom + msw) |
| `npm run check:content` | Poster-script policy check (release checklist 1.12) |

### Content script policy (1.12)

Static HTML in `public/content/` (posters, asmaul-husna sheets) must be
**script-free**: no `<script>` blocks, no inline event handlers (`on*`),
no `javascript:` URLs. Run `npm run check:content` before committing content
changes — CI enforces it. Print behavior uses `@media print` CSS only.

## Folder structure

```
src/
├── app/
│   ├── [lang]/              # Bilingual routes (id/en); / is rewritten to /id
│   │   ├── page.tsx         # Home (content from CMS pages mock)
│   │   ├── kelas/           # Class profiles (PAUD/TK/TPA)
│   │   ├── resources/       # Resource Dashboard (download portal)
│   │   ├── doa/             # Prayer guides
│   │   ├── kontak/          # Enrollment/inquiry form
│   │   └── privacy-policy/  # Privacy policy page (UU PDP)
│   ├── sitemap.ts           # Published-only sitemap with hreflang alternates
│   ├── robots.ts            # Disallows /admin/*
│   └── layout.tsx           # Root layout (fonts, providers)
├── proxy.ts                # / → /id rewrite (bilingual URL scheme)
├── components/
│   ├── landing/             # Navbar, Hero, ClassCard, InquiryForm, PageContent…
│   ├── resources/           # ResourceCard, ResourceGrid, FilterBar, PreviewModal
│   └── ui/                  # Button, Badge, Skeleton
├── hooks/                   # useResources, useDownload, useClasses
└── lib/
    ├── api/                 # Typed REST client (one module per resource)
    ├── data/                # Data-access layer (API or mock fallback)
    ├── types/               # TS types mirroring the PostgreSQL schema
    ├── lang.ts              # Bilingual helpers (pick, localizedHref)
    ├── seo.ts               # buildMetadata: title/description fallback, OG, hreflang
    ├── gtag.ts              # GA4 events: download_material, inquiry_submitted, page_view
    └── mock/                # Demo data for development
```

## API

See [`REST-API.md`](./REST-API.md) for the full endpoint reference.

## Quality

- Skor per dimensi + bukti: [`docs/quality-scorecard.md`](docs/quality-scorecard.md) — **8.9/10** (49 file test, 316 test hijau, CI 4 gerbang).
- Keputusan arsitektur: [`docs/adr/`](docs/adr/) — bilingual URL scheme, proxy same-origin untuk trafik admin.
- Dokumen proses (PRD, desain sistem, QA plan, security, user guide): repo [`tpq-docs`](https://github.com/adul11s/tpq-docs).

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | REST API base; unset = mock-data mode (public pages only — admin requires it) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO/sitemap (default `https://tpq-qurani.example.id`) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | GA4 tag; enables `page_view`, `download_material`, and `inquiry_submitted` tracking when set. **Unset (default) = no GA4 events fired.** Set the real Measurement ID before production launch (GA4 acceptance is Phase-2 per release checklist 1.5). |

> **GA event timing (FND-3):** the client-side `download_material` event fires as soon as the signed download URL is requested — **before** the download itself succeeds (browser download is not observable from JS). The backend `download_count` counter remains the authoritative source for actual downloads.
| `REVALIDATE_SECRET` | Shared secret for `POST /api/revalidate` (backend A4 notifications); unset = route rejects all calls |

> **CI/build note:** static (SSG) pages fetch live API data at build time. `npm run build` therefore requires a **reachable API** at `NEXT_PUBLIC_API_BASE_URL` (run it locally, or point the env at a staging API; omit the env var for a mock-data build). The admin area (`/admin/*`) never falls back to mock mode.

## Admin CMS

Password-protected CMS at `/admin/*` (admin UI is in Indonesian; the public site stays bilingual).
Admin requires a **real backend** — there is **no mock fallback** for any admin route, so
`NEXT_PUBLIC_API_BASE_URL` must point at a running API. Sessions are HttpOnly server-managed cookies;
the client only reacts to 401 by redirecting to `/admin/login`.

### Routes & role matrix

`content_manager` (CM) can edit content but cannot publish, approve, or reach the system pages.
`admin` has full access.

| Route | Page | admin | CM |
|---|---|---|---|
| `/admin` | Dashboard (stats) | ✓ | ✓ |
| `/admin/konten` | Content lists (classes, resources, schedule, curriculum, prayer guides, teachers, testimonials, FAQs, pages, site settings) | ✓ | ✓ |
| `/admin/konten/[entity]` | Entity list | ✓ | ✓ |
| `/admin/konten/[entity]/baru` | Create form | ✓ | ✓ |
| `/admin/konten/[entity]/[id]` | Edit form | ✓ | ✓ |
| `/admin/media` | Media library (upload + reuse) | ✓ | ✓ |
| `/admin/inquiry` | Inquiry inbox (pipeline, WhatsApp reply, CSV export) | ✓ | ✓ |
| `/admin/persetujuan` | Approval queue (publish/archive) | ✓ | – |
| `/admin/pengguna` | Users (2FA reset, deactivate) | ✓ | – |
| `/admin/aktivitas` | Audit log + CSV export | ✓ | – |
| `/admin/pengaturan` | Site settings editor | ✓ | – |
| `/admin/login` | Login | – | – |
| `/admin/login/enroll` | 2FA enrollment | – | – |
| `/admin/login/verify` | TOTP / backup-code verification | – | – |

Content role rules: only `admin` can publish/archive publishable entities (submission goes to the
approval queue); `content_manager` can create and edit drafts.

### First-login 2FA flow

1. **Login** (`/admin/login`) — email + password; the API answers with a challenge (`totp` or `enroll`).
2. **Enroll** (`/admin/login/enroll`) — first login with 2FA off: enter email → scan the **QR code**
   (TOTP secret) → **backup codes shown once** (copy or download, never shown again) → enter the
   current TOTP to confirm.
3. **Verify** (`/admin/login/verify`) — subsequent logins: TOTP from your authenticator, or a backup
   code in `ABCD-EF12` format.
4. Lost your authenticator? An admin resets your 2FA from `/admin/pengguna`; your next login
   re-enrolls.

### Test commands

The admin suite is **Vitest + jsdom + msw** (`tests/`); the API is mocked at the network layer via
`tests/msw-server.ts`, so tests run without a backend.

| Command | Description |
|---|---|
| `npm test` | Vitest run (admin + public tests) |
| `npm run lint` | ESLint |
| `npm run build` | Production build (needs the API reachable for SSG pages) |

### QA mapping (UI-UX Phase C, C1–C11)

| QA item | Task(s) | Test file(s) |
|---|---|---|
| C1 IA & role-aware admin menu | T2, T16 | `tests/menu.test.ts`, `tests/redirect.test.ts` |
| C2 Login + 2FA (challenge, verify, enroll) | T3–T5 | `tests/login.test.tsx`, `tests/enroll.test.tsx`, `tests/verify.test.tsx`, `tests/session.test.tsx` |
| C3 Dashboard | T16 | `tests/dashboard.test.tsx` |
| C4 Content editors (classes, resources) | T7 | `tests/content-crud.test.tsx`, `tests/resource-editor.test.tsx` |
| C5 Media library | T9 | `tests/media.test.tsx` |
| C6 Editorial editors (prayer guides, schedules, curriculum) | T8, T10, T11 | `tests/prayer-guides-editor.test.tsx`, `tests/schedule-editor.test.tsx` |
| C7 Approval queue | T12 | `tests/approval.test.tsx` |
| C8 Inquiry inbox | T13 | `tests/inquiry-inbox.test.tsx` |
| C9 Schedule editor | T10 | `tests/schedule-editor.test.tsx` |
| C10 Aktivitas (audit log) | T15 | `tests/audit.test.tsx` |
| C11 Users (2FA reset, deactivate) | T14 | `tests/users.test.tsx` |

Also covered: session-expiry UX (401 → login) in `tests/session-expiry.test.tsx` and content
revalidation hookup in `tests/revalidate.test.tsx`.

## SA-Dev-Handoff v1.2 status

| Handoff item | Status in this repo |
|---|---|
| §3 Inquiry API (consent, honeypot, validation, 429) | Done — `InquiryForm` + `lib/api/inquiries.ts`; mock validates like the API |
| §7.1 Bilingual `/en/` + ID fallback | Done — `[lang]` routes, middleware rewrite, `pick()` fallback |
| §7.2 SEO (meta/OG/hreflang/sitemap/robots/JSON-LD) | Done |
| §7.3 Privacy policy page + footer link + consent text | Done |
| §8 GA4 dedup + language dimension + `inquiry_submitted` | Done — single client-side event; `page_view` tracker |
| §2 Migrations (`inquiries` cols, `audit_log`, `user_totp`, `pages` SEO) | **Backend** — blocked (no backend repo here) |
| §4 2FA auth flow + CSRF middleware | **Backend** — blocked |
| §5 Audit log + admin "Aktivitas" UI | **Backend** — blocked |
| §6 Upload HTTP 413 | **Backend** — blocked |

## Stack recommendations

| Concern | Library | Why |
|---|---|---|
| Routing / SSR | Next.js App Router | Built-in SSR/SSG/SEO, RSC; no react-router needed |
| State | TanStack Query | Server-cache for the filterable resource grid; server components cover the rest — no Redux |
| Forms | react-hook-form + zod | Typed, validated inquiry form (consent gate, phone regex, honeypot) |
| PDF preview | react-pdf (pdf.js) | In-browser preview; load client-side via `next/dynamic` (SSR-unsafe) |
| Downloads | Signed CDN URLs | Stream from object storage/CDN; `Content-Disposition: attachment` |
| Images | `next/image` | AVIF/WebP, CDN, blur-up placeholders |
