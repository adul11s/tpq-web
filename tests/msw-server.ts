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

export const server = setupServer(adminMeOk);
