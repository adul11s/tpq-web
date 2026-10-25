import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ResourceDetailPage from "@/app/[lang]/resources/[slug]/page";
import type { ResourceDetail } from "@/lib/types/resource";

vi.mock("@/lib/data/resources", () => ({
  fetchResourceBySlug: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

import { fetchResourceBySlug } from "@/lib/data/resources";

function placeholderResource(): ResourceDetail {
  return {
    id: 1,
    slug: "poster-doa",
    title: "Poster Doa Sebelum Makan",
    description: "Poster doa harian untuk dinding rumah.",
    category: { id: 1, slug: "prayers", name: "Doa Harian", description: null },
    ageGroup: "all",
    thumbnailUrl: "/placeholders/prayers.svg",
    downloadCount: 3120,
    publishedAt: "2026-05-10T00:00:00Z",
    fileName: "poster-doa-makan.pdf",
    fileSize: 360_000,
    mimeType: "application/pdf",
    fileUrl: "/samples/sample.pdf",
    previewUrl: "/samples/sample.pdf",
  };
}

async function renderPage(thumbnailUrl: string) {
  vi.mocked(fetchResourceBySlug).mockResolvedValue({
    ...placeholderResource(),
    thumbnailUrl,
  });
  return render(
    await ResourceDetailPage({
      params: Promise.resolve({ lang: "id", slug: "poster-doa" }),
    }),
  );
}

describe("ResourceDetailPage thumbnails (C1 image guard)", () => {
  it("swaps a /placeholders/* thumbnail for the local category photo", async () => {
    const { container } = await renderPage("/placeholders/prayers.svg");
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    // the placeholder SVG path must never be used as the rendered source
    const src = decodeURIComponent(img?.getAttribute("src") ?? "");
    expect(src).not.toContain("/placeholders/");
    expect(src).toContain("prayers");
    expect(
      screen.getAllByText("Poster Doa Sebelum Makan").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders next/image for real (non-placeholder) thumbnail URLs", async () => {
    const { container } = await renderPage("https://cdn.example.id/poster.jpg");
    expect(container.querySelector("img")).not.toBeNull();
  });
});
