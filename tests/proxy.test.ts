import { describe, expect, it } from "vitest";
import { proxy } from "../src/proxy";
import type { NextRequest } from "next/server";

function makeRequest(pathname: string) {
  return {
    nextUrl: {
      pathname,
      clone: () => new URL(`http://localhost:3000${pathname}`),
    },
  } as unknown as NextRequest;
}

describe("proxy", () => {
  it("passes /admin paths through unchanged", () => {
    const response = proxy(makeRequest("/admin/media"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("passes the bare /admin path through unchanged", () => {
    const response = proxy(makeRequest("/admin"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("passes /api paths through unchanged", () => {
    const response = proxy(makeRequest("/api/parent/children"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("still rewrites public paths under /id", () => {
    const response = proxy(makeRequest("/kontak"));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/id/kontak");
  });
});
