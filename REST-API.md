# REST API — TPQ Qur'ani Public Web

Versioned public API consumed by the Next.js frontend. Base URL configured via
`NEXT_PUBLIC_API_BASE_URL` (default `https://api.tpq-qurani.example.id/api/v1`).
When the variable is unset the frontend falls back to mock data in
`src/lib/mock/` so the UI works without a backend.

Aligned with `System-Analyst-Design.md` v1.2 and `SA-Dev-Handoff.md` v1.2
(inquiry consent/honeypot, SEO, bilingual, GA4 dedup).

## Conventions

- **Versioning:** all routes under `/api/v1/*`
- **Auth:** public read endpoints require none; only `published` content is exposed (drafts/archived return 404)
- **JSON** responses; errors use `{ "error": "message" }` with proper HTTP status codes (422 may add `fields` for per-field errors)
- **Pagination:** `page` (1-based) + `page_size`, returned as `meta`
- **Caching:** resource lists cached 5 min, class pages 10 min (Redis), invalidated on publish/archive; cache keys include the language segment
- **Files:** stored in object storage behind a CDN; the API only returns signed URLs
- **Language:** content is bilingual; `*_en` fields fall back to Indonesian when NULL

## Endpoints

### Classes (landing / class profiles)

#### GET `/api/v1/classes`

List published class profiles (PAUD / TK / TPA).

```json
[
  {
    "id": 2,
    "code": "TK",
    "slug": "tk",
    "name": "TK Qur'ani Bintang",
    "name_en": "Qur'ani Kindergarten",
    "age_min": 5,
    "age_max": 6,
    "description": "…",
    "hours": "07.30–10.30 WIB",
    "capacity": "15 anak/kelas"
  }
]
```

#### GET `/api/v1/classes/{code}`

Single class profile including curriculum and sample schedule.

`code`: `PAUD`, `TK`, or `TPA` (case-insensitive).

```json
{
  "code": "TK",
  "fees": 300000,
  "curriculum": [{ "aspect": "quran_targets", "title": "Iqro 3–6 & tajwid dasar", "sort_order": 0 }],
  "schedule": [{ "day_name": "Rabu", "start_time": "08:00", "end_time": "09:00", "activity": "Tahsin & hafalan surat" }]
}
```

### Categories (resource taxonomy)

#### GET `/api/v1/categories`

Fixed CMS-managed set: `prayers`, `readings`, `coloring`, `calligraphy`, `documents`.

### Resources (Resource Dashboard / download portal)

#### GET `/api/v1/resources`

List published materials. Query params:

| Param | Values | Description |
|---|---|---|
| `category` | `prayers` `readings` `coloring` `calligraphy` `documents` | Filter by taxonomy |
| `age_group` | `paud` `tk` `tpa` `all` | Filter by age group |
| `q` | text | Full-text search on title/description (PostgreSQL FTS) |
| `page` | int, default `1` | Page number |
| `page_size` | int, default `12` | Items per page |

```json
{
  "data": [
    {
      "id": 2,
      "slug": "kaligrafi-huruf-hijaiyah-level-2",
      "title": "Kaligrafi Huruf Hijaiyah – Level 2",
      "description": "…",
      "category": { "id": 4, "slug": "calligraphy", "name": "Kaligrafi" },
      "age_group": "tpa",
      "thumbnail_url": "https://cdn.example.id/media/…/thumb.png",
      "download_count": 986,
      "published_at": "2026-07-15T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 12, "total": 9, "total_pages": 1 }
}
```

#### GET `/api/v1/resources/{slug}`

Detail incl. preview + file metadata:

```json
{
  "id": 2,
  "slug": "kaligrafi-huruf-hijaiyah-level-2",
  "title": "…",
  "category": { "slug": "calligraphy" },
  "age_group": "tpa",
  "thumbnail_url": "…",
  "preview_url": "https://cdn.example.id/media/…/preview.pdf",
  "file_name": "kaligrafi-hijaiyah-level-2.pdf",
  "file_size": 510000,
  "mime_type": "application/pdf",
  "download_count": 986
}
```

#### POST `/api/v1/resources/{id}/download`

Initiates a download. Increments `download_count` in the same transaction,
queues a `download_events` row (async), and returns a short-lived signed URL
(10-min expiry) pointing at the CDN. Rate-limited (e.g. 30/min/IP).

```json
{ "download_url": "https://cdn.example.id/…?X-Amz-Signature=…", "file_name": "kaligrafi-hijaiyah-level-2.pdf", "expires_in_seconds": 600 }
```

### Prayer Guides (Doa Harian)

#### GET `/api/v1/prayer-guides`

```json
[
  {
    "id": 1,
    "occasion": "Sebelum makan",
    "occasion_slug": "sebelum-makan",
    "arabic_text": "اللَّهُمَّ بَارِكْ لَنَا …",
    "transliteration": "Allahumma baarik lanaa …",
    "meaning_id": "Ya Allah, berkahilah kami …",
    "meaning_en": "O Allah, bless us …",
    "sort_order": 0
  }
]
```

### Inquiries (enrollment form — SA-Dev-Handoff §3)

#### POST `/api/v1/inquiries`

Consent is a **hard gate**: submissions without `consent_given: true` are
rejected with 422 and never stored. Honeypot submissions are silently
accepted (201) but create no inbox entry and fire no analytics event.

| Field | Required | Validation |
|---|---|---|
| `parent_name` | yes | 2–150 chars |
| `phone` | yes | `^(\+62\|62\|0)8[0-9]{7,11}$` |
| `whatsapp` | no | same regex; defaults to `phone` |
| `child_age` | no | free text ≤ 30 chars |
| `program_class_id` | no | FK → published `classes.id` (422 otherwise) |
| `message` | no | ≤ 2000 chars |
| `consent_given` | **yes** | must be `true` → else 422 "Anda harus menyetujui Kebijakan Privasi" |
| `privacy_policy_version` | yes | must equal current version in `site_settings` → mismatch 422 |
| `website` | no (honeypot) | if filled: silently accepted, no inbox entry, no event |

- Success: `201` with `{ "id", "message": "Terima kasih…" }`
- Rate limit: 5/hour/IP (separate bucket) → `429`
- PII export (CSV): `admin` only; each export writes an `inquiry_export` audit row

### Pages (CMS content — SA-Dev-Handoff §7)

#### GET `/api/v1/pages`

Published pages only (`pages` table: home, about, contact, privacy-policy…).
Returns bilingual content blocks + SEO fields:

```json
[
  {
    "slug": "privacy-policy",
    "title_id": "Kebijakan Privasi",
    "title_en": "Privacy Policy",
    "content_id": [{ "id": "intro", "type": "paragraph", "text": "…" }],
    "content_en": null,
    "seo_title_id": null,
    "seo_description_id": null,
    "status": "published"
  }
]
```

#### GET `/api/v1/pages/{slug}`

Single published page; 404 for drafts/archived.

### Site settings

#### GET `/api/v1/site-settings`

Public subset: `address`, `map_link`, `phone`, `whatsapp`, `hours`,
`facebook`, `instagram`, `privacy_policy_url`, `privacy_policy_version`.

## Error handling

| Status | Meaning |
|---|---|
| `404` | Not found, or content is draft/archived (hidden from public) |
| `422` | Invalid query params |
| `429` | Rate limit exceeded |
| `500` | Server error; file missing in storage (admin notified) |

## Admin API (out of scope for this repo)

Admin CMS endpoints (`/api/v1/admin/*`) require session auth (JWT in
HttpOnly + SameSite cookie, anti-CSRF token). See System-Analyst-Design.md §2.
