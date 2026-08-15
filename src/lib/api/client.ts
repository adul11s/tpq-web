export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const USE_MOCK_DATA = !API_BASE_URL;

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (fields) this.fields = fields;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(500, "NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Tidak dapat terhubung ke server");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new ApiError(response.status, body?.error ?? "Terjadi kesalahan");
  }

  return (await response.json()) as T;
}
