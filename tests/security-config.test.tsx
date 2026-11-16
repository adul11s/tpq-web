import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { OrganizationJsonLd } from "@/components/landing/OrganizationJsonLd";
import type { SiteSettings } from "@/lib/types/siteSettings";

afterEach(() => vi.unstubAllEnvs());

describe("JSON-LD", () => {
  it("cannot close its script tag through site settings", () => {
    const payload = '</script><script>alert("xss")</script>';
    const html = renderToStaticMarkup(<OrganizationJsonLd settings={{
      address: payload,
      phone: payload,
      facebook: payload,
      instagram: null,
    } as SiteSettings} />);

    const document = new DOMParser().parseFromString(html, "text/html");
    const scripts = document.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(html).not.toContain(payload);
    expect(JSON.parse(scripts[0].textContent!).telephone).toBe(payload);
  });
});

describe("image optimization", () => {
  it.each(["production", "test", "development"])("limits local IP access in %s", async (env) => {
    vi.stubEnv("NODE_ENV", env);
    vi.resetModules();
    const { default: config } = await import("../next.config");
    expect(config.images?.dangerouslyAllowLocalIP).toBe(env === "development");
    expect(config.images?.remotePatterns?.some((pattern) =>
      !(pattern instanceof URL) && pattern.hostname === "localhost",
    )).toBe(env === "development");
  });
});
