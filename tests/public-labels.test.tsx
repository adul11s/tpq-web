import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, API_BASE } from "./msw-server";
import { Navbar } from "@/components/landing/Navbar";
import { DoaCatalog } from "@/components/doa/DoaCatalog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResourcesDashboard } from "@/components/resources/ResourcesDashboard";
import type { PrayerGuide } from "@/lib/types/prayerGuide";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const GUIDE: PrayerGuide = {
  id: 1,
  occasion: "Sebelum makan",
  occasionSlug: "sebelum-makan",
  arabicText: "اللَّهُمَّ بَارِكْ لَنَا",
  transliteration: "Allahumma baarik lanaa",
  meaningId: "Ya Allah, berkahilah kami.",
  meaningEn: "O Allah, bless us.",
  sortOrder: 0,
};

describe("Bilingual stragglers (I5)", () => {
  it("localizes the Navbar hamburger aria-label in EN mode", () => {
    render(<Navbar lang="en" />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("localizes DoaCatalog share-toast category label in EN mode", () => {
    render(<DoaCatalog lang="en" guides={[GUIDE]} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Share Sebelum makan" })[0],
    );
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Eating & Drinking");
    expect(toast).not.toHaveTextContent("Makan & Minum");
  });
});

const RESOURCES = [
  {
    id: 1,
    slug: "kaligrafi-bismillah",
    title: "Kaligrafi Bismillah",
    description: "Latihan menebalkan lafaz Bismillah.",
    category: { id: 4, slug: "calligraphy", name: "Kaligrafi", description: null },
    age_group: "tk",
    thumbnail_url: "/placeholders/calligraphy.svg",
    download_count: 1234,
    published_at: null,
  },
  {
    id: 2,
    slug: "doa-sebelum-makan",
    title: "Poster Doa Sebelum Makan",
    description: "Poster doa harian.",
    category: { id: 1, slug: "prayers", name: "Doa Harian", description: null },
    age_group: "all",
    thumbnail_url: "/placeholders/prayers.svg",
    download_count: 3120,
    published_at: null,
  },
];

function resourcesHandler() {
  return http.get(`${API_BASE}/resources`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("page_size") ?? 12);
    let items = RESOURCES;
    if (category) {
      items = items.filter((item) => item.category.slug === category);
    }
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      data: items.slice(start, start + pageSize),
      meta: {
        page,
        page_size: pageSize,
        total: items.length,
        total_pages: Math.max(1, Math.ceil(items.length / pageSize)),
      },
    });
  });
}

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ResourcesDashboard lang="en" />
    </QueryClientProvider>,
  );
}

describe("ResourcesDashboard EN mode (I5 stragglers)", () => {
  it("localizes the search sr-only label, filter group label, and age select label", async () => {
    server.use(resourcesHandler());
    renderDashboard();

    expect(await screen.findByLabelText("Search materials")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter materials by category"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Age group")).toBeInTheDocument();
  });

  it("localizes the long-press tip line and ResourceCard labels in EN mode", async () => {
    server.use(resourcesHandler());
    renderDashboard();

    expect(
      await screen.findByText(/long-press the Download button to save the PDF file/i),
    ).toBeInTheDocument();
    const previewLink = await screen.findByRole("link", {
      name: "Preview Kaligrafi Bismillah",
    });
    expect(previewLink).toHaveAttribute("href", "/en/resources/kaligrafi-bismillah");
    expect(
      screen.getByRole("button", { name: "Download PDF Kaligrafi Bismillah" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("2 materials")).toBeInTheDocument(),
    );
  });
});
