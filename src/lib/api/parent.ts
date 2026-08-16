import { ApiError } from "./client";

export interface ParentLoginResult {
  ok: true;
  must_change_password: boolean;
}

export interface ParentMe {
  ok: true;
  email: string;
  full_name: string;
  must_change_password: boolean;
}

export interface ParentRaporPeriod {
  period_id: number;
  semester: "ganjil" | "genap";
  academic_year: string;
}

export interface ParentChild {
  student_id: number;
  full_name: string;
  nis: string | null;
  class: string | null;
  academic_year: string | null;
  rapor_periods: ParentRaporPeriod[];
}

export interface ParentRaporMeta {
  student_id: number;
  rapor_period_id: number;
  file_size: number;
  finalized_at: string | null;
}

export interface ParentRaporDownload {
  download_url: string;
  file_name: string;
}

async function parentFetch<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const method = init?.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;
  if (init?.body !== undefined) {
    body = JSON.stringify(init.body);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`/api/parent${path}`, {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    let message = "Terjadi kesalahan";
    try {
      const parsed = JSON.parse(bodyText) as { error?: string };
      message = parsed.error ?? message;
    } catch {
      /* non-JSON */
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

export const parentApi = {
  login: (input: { email: string; password: string }): Promise<ParentLoginResult> =>
    parentFetch<ParentLoginResult>("/auth/login", { method: "POST", body: input }),

  changePassword: (input: {
    current_password: string;
    new_password: string;
  }): Promise<{ ok: true }> =>
    parentFetch<{ ok: true }>("/auth/change-password", {
      method: "POST",
      body: input,
    }),

  logout: (): Promise<{ ok: true }> =>
    parentFetch<{ ok: true }>("/auth/logout", { method: "POST" }),

  me: (): Promise<ParentMe> => parentFetch<ParentMe>("/me"),

  children: (): Promise<{ children: ParentChild[] }> =>
    parentFetch<{ children: ParentChild[] }>("/children"),

  rapor: (studentId: number, periodId: number): Promise<ParentRaporMeta> =>
    parentFetch<ParentRaporMeta>(`/rapor/${studentId}/${periodId}`),

  raporDownload: (studentId: number, periodId: number): Promise<ParentRaporDownload> =>
    parentFetch<ParentRaporDownload>(`/rapor/${studentId}/${periodId}/download`),
};