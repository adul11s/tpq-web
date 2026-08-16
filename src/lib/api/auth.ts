import { adminFetch } from "./admin-client";
import type { AdminMe } from "../types/admin";

export type LoginChallenge = "totp" | "enroll";

export type LoginResponse =
  | { challenge: LoginChallenge }
  | { ok: true };

export interface EnrollResponse {
  secret: string;
  otpauth_uri: string;
  backup_codes: string[];
}

export const adminApi = {
  login: (email: string, password: string) =>
    adminFetch<LoginResponse>("/admin/auth/login", {
      method: "POST",
      body: { email: email.toLowerCase(), password },
    }),
  verify: (email: string, token: string) =>
    adminFetch<{ ok: true }>("/admin/auth/verify-2fa", {
      method: "POST",
      body: { email: email.toLowerCase(), token },
    }),
  enroll: (email: string) =>
    adminFetch<EnrollResponse>("/admin/auth/enroll", {
      method: "POST",
      body: { email: email.toLowerCase() },
    }),
  enrollConfirm: (
    email: string,
    secret: string,
    token: string,
    backup_codes: string[]
  ) =>
    adminFetch<{ ok: true }>("/admin/auth/enroll-confirm", {
      method: "POST",
      body: { email: email.toLowerCase(), secret, token, backup_codes },
    }),
  logout: () => adminFetch<{ ok: true }>("/admin/auth/logout", { method: "POST" }),
  me: () => adminFetch<AdminMe>("/admin/me"),
};
