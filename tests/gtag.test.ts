import { afterEach, describe, expect, it, vi } from "vitest";

type Trackable = {
  event: string;
  [key: string]: unknown;
};

describe("gtag GA4 guards (FND 1.3)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("does not push download or inquiry events when GA4 is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA4_MEASUREMENT_ID", "");
    vi.resetModules();
    const gtag = await import("@/lib/gtag");

    window.dataLayer = [];
    gtag.trackDownload({
      event: "download_material",
      resource_id: 1,
      resource_title: "Kaligrafi Bismillah",
      category: "calligraphy",
      age_group: "tk",
      language: "id",
    });
    gtag.trackInquirySubmitted({ event: "inquiry_submitted", language: "id" });

    expect(window.dataLayer).toEqual([]);
  });

  it("pushes download and inquiry events when GA4 is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA4_MEASUREMENT_ID", "G-TEST");
    vi.resetModules();
    const gtag = await import("@/lib/gtag");

    window.dataLayer = [];
    gtag.trackDownload({
      event: "download_material",
      resource_id: 1,
      resource_title: "Kaligrafi Bismillah",
      category: "calligraphy",
      age_group: "tk",
      language: "id",
    });
    gtag.trackInquirySubmitted({ event: "inquiry_submitted", language: "en" });

    expect(window.dataLayer).toHaveLength(2);
    const events = window.dataLayer as Trackable[];
    expect(events[0]).toMatchObject({ event: "download_material", language: "id" });
    expect(events[1]).toMatchObject({ event: "inquiry_submitted", language: "en" });
  });
});
