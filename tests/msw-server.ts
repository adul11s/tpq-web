import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { AdminMe } from "../src/lib/types/admin";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const ME: AdminMe = {
  id: 1,
  email: "admin@tpq-qurani.example.id",
  full_name: "Ustadz Admin",
  role: "admin",
  has_2fa: true,
};

export const adminMeOk = http.get(`${API_BASE}/admin/me`, () =>
  HttpResponse.json(ME)
);

export const adminMeUnauthorized = http.get(`${API_BASE}/admin/me`, () =>
  HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
);

export const adminLoginChallenge = (challenge: "totp" | "enroll") =>
  http.post(`${API_BASE}/admin/auth/login`, () =>
    HttpResponse.json({ challenge })
  );

export const adminLoginUnauthorized = http.post(`${API_BASE}/admin/auth/login`, () =>
  HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
);

export const adminLoginRateLimited = http.post(`${API_BASE}/admin/auth/login`, () =>
  HttpResponse.json(
    { error: "Terlalu banyak percobaan login, coba lagi nanti" },
    { status: 429 }
  )
);

export const adminLoginDelayed = http.post(`${API_BASE}/admin/auth/login`, async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return HttpResponse.json({ challenge: "totp" });
});

export const adminVerifyOk = http.post(`${API_BASE}/admin/auth/verify-2fa`, () =>
  HttpResponse.json({ ok: true })
);

export const adminVerifyUnauthorized = http.post(
  `${API_BASE}/admin/auth/verify-2fa`,
  () => HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
);

export const adminVerifyRateLimited = http.post(
  `${API_BASE}/admin/auth/verify-2fa`,
  () =>
    HttpResponse.json(
      { error: "Terlalu banyak percobaan verifikasi, coba lagi nanti" },
      { status: 429 }
    )
);

export const ENROLL_SECRET = "JBSWY3DPEHPK3PXP";
export const ENROLL_OTPAUTH_URI =
  "otpauth://totp/TPQ%20Qurani:admin%40tpq-qurani.example.id?secret=JBSWY3DPEHPK3PXP&issuer=TPQ%20Qurani";
export const ENROLL_BACKUP_CODES = [
  "A1B2-C3D4",
  "E5F6-G7H8",
  "I9J0-K1L2",
  "M3N4-O5P6",
  "Q7R8-S9T0",
  "U1V2-W3X4",
  "Y5Z6-A7B8",
  "C9D0-E1F2",
];

export const adminEnrollOk = http.post(`${API_BASE}/admin/auth/enroll`, () =>
  HttpResponse.json({
    secret: ENROLL_SECRET,
    otpauth_uri: ENROLL_OTPAUTH_URI,
    backup_codes: ENROLL_BACKUP_CODES,
  })
);

export const adminEnrollConflict = http.post(`${API_BASE}/admin/auth/enroll`, () =>
  HttpResponse.json({ error: "2FA already configured" }, { status: 409 })
);

export const adminEnrollConfirmCapture = (onBody: (body: unknown) => void) =>
  http.post(`${API_BASE}/admin/auth/enroll-confirm`, async ({ request }) => {
    onBody(await request.json());
    return HttpResponse.json({ ok: true });
  });

export const adminEnrollConfirmUnauthorized = http.post(
  `${API_BASE}/admin/auth/enroll-confirm`,
  () => HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
);

export const server = setupServer(adminMeOk);
