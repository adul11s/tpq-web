// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import * as admin from "@/app/api/admin/[...route]/route";
import * as parent from "@/app/api/parent/[...route]/route";

afterEach(() => vi.unstubAllGlobals());

describe.each([
  ["admin", admin],
  ["parent", parent],
] as const)("%s API proxy", (name, route) => {
  it.each([204, 205, 304])("forwards status %i without a response body", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, {
      status,
      headers: { "set-cookie": "session=updated; HttpOnly; Path=/" },
    })));

    const response = await route.GET(
      new NextRequest(`http://localhost/api/${name}/me`),
      { params: Promise.resolve({ route: ["me"] }) },
    );

    expect(response.status).toBe(status);
    expect(response.body).toBeNull();
    expect(response.headers.getSetCookie()).toEqual(["session=updated; HttpOnly; Path=/"]);
  });

  it("preserves JSON error responses and request cookies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ error: "Forbidden" }, { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await route.GET(
      new NextRequest(`http://localhost/api/${name}/me?check=1`, { headers: { cookie: "session=test" } }),
      { params: Promise.resolve({ route: ["me"] }) },
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
    expect(fetchMock.mock.calls[0][0]).toBe(`http://localhost:3100/api/v1/${name}/me?check=1`);
    expect(fetchMock.mock.calls[0][1].headers.get("cookie")).toBe("session=test");
  });
});
