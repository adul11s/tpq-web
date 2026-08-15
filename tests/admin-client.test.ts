import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  adminFetch,
  setOnForbidden,
  setOnUnauthorized,
} from "../src/lib/api/admin-client";

describe("adminFetch", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sends credentials and CSRF header on POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await adminFetch("/api/v1/admin/auth/logout", { method: "POST" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("include");
    expect(init.headers["x-csrf-token"]).toBe("abc123");
  });

  it("calls the 401 handler and rethrows", async () => {
    const handler = vi.fn();
    setOnUnauthorized(handler);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"error":"Unauthorized"}', { status: 401 })));
    await expect(adminFetch("/api/v1/admin/users")).rejects.toThrow();
    expect(handler).toHaveBeenCalled();
  });

  it("calls the 403 handler and rethrows with the API message", async () => {
    const handler = vi.fn();
    setOnForbidden(handler);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response('{"error":"Forbidden"}', { status: 403 }))
    );
    const error = await adminFetch("/api/v1/admin/users", { method: "POST" }).catch(
      (e: unknown) => e
    );
    expect(error).toMatchObject({ status: 403, message: "Forbidden" });
    expect(handler).toHaveBeenCalled();
  });
});
