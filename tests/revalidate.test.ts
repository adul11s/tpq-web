import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { POST } from "../src/app/api/revalidate/route";

const ORIGINAL_SECRET = process.env.REVALIDATE_SECRET;

describe("revalidate route", () => {
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = "super-secret";
    vi.clearAllMocks();
  });

  it("rejects without the secret header", async () => {
    const res = await POST(new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ entity: "resource", id: 1 }),
    }));
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret", async () => {
    const res = await POST(new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "x-revalidate-secret": "wrong" },
      body: JSON.stringify({}),
    }));
    expect(res.status).toBe(401);
  });

  it("accepts the correct secret and revalidates paths", async () => {
    const res = await POST(new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "x-revalidate-secret": "super-secret" },
      body: JSON.stringify({ entity: "resource", id: 3, slug: "abc" }),
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.revalidated.slug).toBe("abc");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
  });

  it("rejects when the env secret is unset", async () => {
    delete process.env.REVALIDATE_SECRET;
    const res = await POST(new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "x-revalidate-secret": "super-secret" },
      body: JSON.stringify({}),
    }));
    expect(res.status).toBe(401);
  });

  it("handles a malformed body without crashing", async () => {
    const res = await POST(new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "x-revalidate-secret": "super-secret" },
      body: "{not-json",
    }));
    expect(res.status).toBe(200);
    expect(res.json()).resolves.toMatchObject({ ok: true });
  });

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.REVALIDATE_SECRET;
    } else {
      process.env.REVALIDATE_SECRET = ORIGINAL_SECRET;
    }
  });
});
