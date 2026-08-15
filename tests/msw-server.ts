import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { AdminMe } from "../src/lib/types/admin";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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

export const server = setupServer(adminMeOk);
