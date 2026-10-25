# ADR 0002 — Trafik admin lewat proxy same-origin, bukan panggilan cross-origin

- **Status:** Accepted
- **Tanggal:** 2026-10-25 (dicatat dari commit `d1ef8fd`)
- **Konteks:** Web (Vercel) dan API (Render) beda origin. Sesi admin memakai
  cookie HttpOnly + CSRF token. Kalau browser memanggil API langsung:
  cookie menjadi third-party (diblokir Safari/Chrome, `SameSite=None` tetap
  rapuh), dan pengecekan origin CSRF di API menolak request dari origin web.

## Keputusan

Semua trafik terautentikasi lewat route handler Next.js yang bertindak sebagai
proxy same-origin:

- `src/app/api/admin/[...route]/route.ts` → `{API_BASE}/admin/*`
- `src/app/api/parent/[...route]/route.ts` → `{API_BASE}/parent/*`

Header yang diteruskan dibatasi daftar putih (`cookie`, `content-type`,
`accept`, `x-csrf-token`, `origin`), body diteruskan sebagai `arrayBuffer`, dan
`Set-Cookie` dari upstream diteruskan balik ke browser. Panggilan publik
(katalog, unduhan, inquiry) tetap langsung ke API dengan CORS.

## Konsekuensi

- Positif: cookie sesi jadi first-party, CSRF origin check tetap ketat, tidak
  perlu melonggarkan `SameSite`/CORS untuk area admin.
- Negatif: satu hop tambahan (latency kecil), body upload melewati server
  Next.js (batas ukuran platform), dan proxy harus ikut diperbarui kalau API
  menambah header. `NEXT_PUBLIC_API_BASE_URL` wajib ada — admin **tidak punya**
  fallback mock.
- Keamanan: hanya path di bawah `/admin` dan `/parent` yang diteruskan; tidak
  ada proxy generik ke origin arbitrer.

## Alternatif yang ditolak

- **`SameSite=None` + CORS kredensial:** tetap third-party cookie di Safari,
  dan memperlebar permukaan CSRF.
- **Token di localStorage (Bearer):** rentan XSS, dan menghapus proteksi
  HttpOnly yang sudah ada.
- **Satukan web+API di satu origin:** menambah biaya infra dan mengikat dua
  deployment (Vercel vs Render) yang sengaja dipisah.

## Bukti di kode

`src/app/api/admin/[...route]/route.ts`, `src/app/api/parent/[...route]/route.ts`,
`tests/proxy.test.ts`, `tests/session.test.tsx`.
