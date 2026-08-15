# TPQ Qur'ani — Web Frontend

Public website for PAUD/TK/TPA Qur'ani: landing pages (class profiles), a
Resource Dashboard (downloadable materials: prayers, readings, coloring,
calligraphy), bilingual routing (`/` = ID, `/en/` = EN), and an enrollment
inquiry form. Built with **Next.js (App Router) + React 19 + TypeScript +
Tailwind CSS**, aligned with `System-Analyst-Design.md` v1.2 and
`SA-Dev-Handoff.md` v1.2.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Without a backend, the app runs in **mock-data mode** (`src/lib/mock/`).
Point it at the real API by copying `.env.example` to `.env.local` and setting
`NEXT_PUBLIC_API_BASE_URL`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

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

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | REST API base; unset = mock-data mode |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO/sitemap (default `https://tpq-qurani.example.id`) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | GA4 tag; enables `page_view` tracking when set |

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
