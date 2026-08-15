import { ApiError } from "./client";

let onUnauthorized: (() => void) | undefined;

export function setOnUnauthorized(fn: () => void) { onUnauthorized = fn; }

function csrfToken(): string {
  const match = document.cookie.split("; ").find((c) => c.startsWith("tpq_csrf="));
  return match ? match.slice("tpq_csrf=".length) : "";
}

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function adminFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown; formData?: FormData }
): Promise<T> {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new ApiError(500, "NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  const method = init?.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;
  if (init?.formData) {
    body = init.formData;                       // multipart: no Content-Type (browser sets boundary)
  } else if (init?.body !== undefined) {
    body = JSON.stringify(init.body);
    headers["Content-Type"] = "application/json";
  }
  if (UNSAFE.has(method)) headers["x-csrf-token"] = csrfToken();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    method, headers, body, credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) onUnauthorized?.();
    const bodyText = await res.text().catch(() => "");
    let message = "Terjadi kesalahan";
    let fields: Record<string, string> | undefined;
    try {
      const parsed = JSON.parse(bodyText) as {
        error?: string;
        fields?: Record<string, string>;
      };
      message = parsed.error ?? message;
      if (parsed.fields && typeof parsed.fields === "object") fields = parsed.fields;
    } catch { /* non-JSON */ }
    throw new ApiError(res.status, message, fields);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
