import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { parentApi } from "@/lib/api/parent";

function jsonResponse(body: unknown, status = 200) {
  const text =
    typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(text),
  } as Response;
}

describe("parentApi", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function lastCall(): { url: string; init: RequestInit } {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return { url, init };
  }

  it("POSTs login to the same-origin proxy with credentials", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ ok: true, must_change_password: true }),
    );

    const res = await parentApi.login({
      email: "ibu@example.com",
      password: "secret123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const { url, init } = lastCall();
    expect(url).toBe("/api/parent/auth/login");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init.body))).toEqual({
      email: "ibu@example.com",
      password: "secret123",
    });
    expect(res).toEqual({ ok: true, must_change_password: true });
  });

  it("changes the parent password", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    const res = await parentApi.changePassword({
      current_password: "oldpass123",
      new_password: "newpass123",
    });

    const { url, init } = lastCall();
    expect(url).toBe("/api/parent/auth/change-password");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(JSON.parse(String(init.body))).toEqual({
      current_password: "oldpass123",
      new_password: "newpass123",
    });
    expect(res).toEqual({ ok: true });
  });

  it("logs out", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    const res = await parentApi.logout();

    const { url, init } = lastCall();
    expect(url).toBe("/api/parent/auth/logout");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(res).toEqual({ ok: true });
  });

  it("fetches /me", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ok: true,
        email: "ibu@example.com",
        full_name: "Ibu Siti Rahma",
        must_change_password: false,
      }),
    );

    const res = await parentApi.me();

    const { url, init } = lastCall();
    expect(url).toBe("/api/parent/me");
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("include");
    expect(res).toEqual({
      ok: true,
      email: "ibu@example.com",
      full_name: "Ibu Siti Rahma",
      must_change_password: false,
    });
  });

  it("lists children with the real DTO shape including rapor_periods", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        children: [
          {
            student_id: 1,
            full_name: "Aisyah",
            nis: "TPQ-2026-0001",
            class: "TK Qur'ani Bintang",
            academic_year: "2026/2027",
            rapor_periods: [
              { period_id: 2, semester: "ganjil", academic_year: "2026/2027" },
            ],
          },
        ],
      }),
    );

    const res = await parentApi.children();

    const { url } = lastCall();
    expect(url).toBe("/api/parent/children");
    expect(res.children).toHaveLength(1);
    expect(res.children[0]).toEqual({
      student_id: 1,
      full_name: "Aisyah",
      nis: "TPQ-2026-0001",
      class: "TK Qur'ani Bintang",
      academic_year: "2026/2027",
      rapor_periods: [
        { period_id: 2, semester: "ganjil", academic_year: "2026/2027" },
      ],
    });
    expect(res.children[0].rapor_periods[0].semester).toBe("ganjil");
  });

  it("fetches rapor metadata", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        student_id: 1,
        rapor_period_id: 2,
        file_size: 4096,
        finalized_at: "2026-08-16T08:00:00.000Z",
      }),
    );

    const res = await parentApi.rapor(1, 2);

    const { url } = lastCall();
    expect(url).toBe("/api/parent/rapor/1/2");
    expect(res).toEqual({
      student_id: 1,
      rapor_period_id: 2,
      file_size: 4096,
      finalized_at: "2026-08-16T08:00:00.000Z",
    });
  });

  it("fetches a presigned rapor download url", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        download_url: "https://storage.example/rapor-1-2.pdf?X-Amz-Signature=abc",
        file_name: "rapor-1-2.pdf",
      }),
    );

    const res = await parentApi.raporDownload(1, 2);

    const { url } = lastCall();
    expect(url).toBe("/api/parent/rapor/1/2/download");
    expect(res.download_url).toContain("X-Amz-Signature");
    expect(res.file_name).toBe("rapor-1-2.pdf");
  });

  it("throws ApiError carrying status and message on non-2xx", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Invalid credentials" }, 401),
    );

    const error = await parentApi
      .login({ email: "ibu@example.com", password: "wrong" })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, message: "Invalid credentials" });
  });

  it("throws ApiError for a 403 must-change-password gate", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Password harus diganti terlebih dahulu" }, 403),
    );

    const error = await parentApi.children().catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 403,
      message: "Password harus diganti terlebih dahulu",
    });
  });
});