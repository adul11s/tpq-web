import { beforeEach, describe, expect, it } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server, API_BASE } from "./msw-server";
import { ResourcesDashboard } from "@/components/resources/ResourcesDashboard";

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
    slug: "kaligrafi-asmaul-husna",
    title: "Menebalkan Asmaul Husna",
    description: "Kumpulan nama-nama Allah untuk latihan kaligrafi.",
    category: { id: 4, slug: "calligraphy", name: "Kaligrafi", description: null },
    age_group: "tpa",
    thumbnail_url: "/placeholders/calligraphy.svg",
    download_count: 986,
    published_at: null,
  },
  {
    id: 3,
    slug: "mewarnai-masjid",
    title: "Mewarnai Masjid",
    description: "Gambar masjid siap dicetak dan diwarnai.",
    category: { id: 3, slug: "coloring", name: "Mewarnai", description: null },
    age_group: "paud",
    thumbnail_url: "/placeholders/coloring.svg",
    download_count: 2110,
    published_at: null,
  },
  {
    id: 4,
    slug: "mewarnai-huruf-hijaiyah",
    title: "Mewarnai Huruf Hijaiyah",
    description: "Lembar mewarnai huruf hijaiyah.",
    category: { id: 3, slug: "coloring", name: "Mewarnai", description: null },
    age_group: "tk",
    thumbnail_url: "/placeholders/coloring.svg",
    download_count: 1875,
    published_at: null,
  },
  {
    id: 5,
    slug: "doa-sebelum-makan",
    title: "Poster Doa Sebelum Makan",
    description: "Poster doa harian untuk dinding rumah.",
    category: { id: 1, slug: "prayers", name: "Doa Harian", description: null },
    age_group: "all",
    thumbnail_url: "/placeholders/prayers.svg",
    download_count: 3120,
    published_at: null,
  },
  {
    id: 6,
    slug: "doa-sebelum-tidur",
    title: "Doa Sebelum Tidur",
    description: "Doa sebelum tidur dengan arti.",
    category: { id: 1, slug: "prayers", name: "Doa Harian", description: null },
    age_group: "all",
    thumbnail_url: "/placeholders/prayers.svg",
    download_count: 1540,
    published_at: null,
  },
  {
    id: 7,
    slug: "bacaan-iqro-pemula",
    title: "Lembar Latihan Iqro Pemula",
    description: "Latihan membaca huruf berharakat.",
    category: { id: 2, slug: "readings", name: "Bacaan", description: null },
    age_group: "tpa",
    thumbnail_url: "/placeholders/readings.svg",
    download_count: 2650,
    published_at: null,
  },
  {
    id: 8,
    slug: "bacaan-huruf-sambung",
    title: "Latihan Huruf Sambung",
    description: "Menulis huruf sambung dengan garis bantu.",
    category: { id: 2, slug: "readings", name: "Bacaan", description: null },
    age_group: "tpa",
    thumbnail_url: "/placeholders/readings.svg",
    download_count: 1420,
    published_at: null,
  },
  {
    id: 9,
    slug: "brosur-pendaftaran",
    title: "Brosur Pendaftaran 2026/2027",
    description: "Informasi program dan cara mendaftar.",
    category: { id: 5, slug: "documents", name: "Dokumen", description: null },
    age_group: "all",
    thumbnail_url: "/placeholders/documents.svg",
    download_count: 830,
    published_at: null,
  },
];

function resourcesHandler() {
  return http.get(`${API_BASE}/resources`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const ageGroup = url.searchParams.get("age_group");
    const q = url.searchParams.get("q");
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("page_size") ?? 12);
    let items = RESOURCES;
    if (category) {
      items = items.filter((item) => item.category.slug === category);
    }
    if (ageGroup) {
      items = items.filter((item) => item.age_group === ageGroup);
    }
    if (q) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(q.toLowerCase()),
      );
    }
    const total = items.length;
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      data: items.slice(start, start + pageSize),
      meta: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  });
}

function downloadHandler() {
  return http.post(`${API_BASE}/resources/:id/download`, () =>
    HttpResponse.json({
      download_url: "/samples/sample.pdf",
      file_name: "materi.pdf",
      expires_in_seconds: 600,
    }),
  );
}

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ResourcesDashboard lang="id" />
    </QueryClientProvider>,
  );
}

describe("ResourcesDashboard (public resources page)", () => {
  beforeEach(() => {
    server.use(resourcesHandler(), downloadHandler());
  });

  it("renders category chips with counts from the list data", async () => {
    renderDashboard();

    const semua = await screen.findByRole("button", { name: /^Semua/ });
    await waitFor(() =>
      expect(within(semua).getByText("9")).toBeInTheDocument(),
    );

    const doaChip = screen.getByRole("button", { name: /^Doa Harian/ });
    expect(within(doaChip).getByText("2")).toBeInTheDocument();
    expect(within(doaChip).getByText("Daily Prayers")).toBeInTheDocument();

    const kaligrafiChip = screen.getByRole("button", { name: /^Kaligrafi/ });
    expect(within(kaligrafiChip).getByText("2")).toBeInTheDocument();

    const mewarnaiChip = screen.getByRole("button", { name: /^Mewarnai/ });
    expect(within(mewarnaiChip).getByText("2")).toBeInTheDocument();

    const bacaanChip = screen.getByRole("button", { name: /^Bacaan/ });
    expect(within(bacaanChip).getByText("2")).toBeInTheDocument();
  });

  it("shows the result count in an aria-live region and filters by chip", async () => {
    renderDashboard();

    const liveRegion = await screen.findByText("9 materi");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");

    fireEvent.click(screen.getByRole("button", { name: /^Mewarnai/ }));
    await waitFor(() => {
      expect(screen.queryByText("2 materi")).toBeInTheDocument();
    });
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getByText("Mewarnai Masjid")).toBeInTheDocument();
    expect(screen.queryByText("Kaligrafi Bismillah")).not.toBeInTheDocument();
  });

  it("keeps age-group filtering working as a secondary control", async () => {
    renderDashboard();

    const ageSelect = await screen.findByLabelText("Kelompok usia");
    fireEvent.change(ageSelect, { target: { value: "tpa" } });

    await waitFor(() => {
      expect(screen.queryByText("3 materi")).toBeInTheDocument();
    });
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("shows the empty state and Hapus Filter resets all filters", async () => {
    renderDashboard();

    const search = await screen.findByLabelText("Cari materi");
    fireEvent.change(search, { target: { value: "zzzz-tidak-ada" } });

    expect(
      await screen.findByText("Tidak ada materi ditemukan"),
    ).toBeInTheDocument();
    expect(screen.getByText("Coba ubah filter atau cari kata lain.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hapus Filter" }));

    await waitFor(() => {
      expect(screen.queryByText("Tidak ada materi ditemukan")).not.toBeInTheDocument();
    });
    expect(screen.getByText("9 materi")).toBeInTheDocument();
    expect(search).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /^Semua/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Kelompok usia")).toHaveValue("all");
  });

  it("shows a success toast with a WhatsApp share action after downloading", async () => {
    renderDashboard();

    const downloadButton = await screen.findByRole("button", {
      name: "Unduh PDF Kaligrafi Bismillah",
    });
    fireEvent.click(downloadButton);

    const toast = await screen.findByRole("status");
    expect(toast).toHaveTextContent("Terima kasih!");
    expect(toast).toHaveTextContent(
      "PDF Kaligrafi Bismillah siap diunduh.",
    );
    const shareLink = within(toast).getByRole("link", {
      name: "Bagikan via WhatsApp",
    });
    expect(shareLink.getAttribute("href")).toContain("https://wa.me/?text=");
    expect(decodeURIComponent(shareLink.getAttribute("href") ?? "")).toContain(
      "Kaligrafi Bismillah",
    );
  });

  it("shows the error state and recovers via the retry button", async () => {
    server.use(
      http.get(`${API_BASE}/resources`, () =>
        HttpResponse.json({ error: "Internal server error" }, { status: 500 }),
      ),
    );
    renderDashboard();

    expect(
      await screen.findByText("Materi sedang diperbaiki. Coba lagi nanti."),
    ).toBeInTheDocument();

    server.use(resourcesHandler());
    fireEvent.click(screen.getByRole("button", { name: "Coba Lagi" }));

    expect(await screen.findByText("Kaligrafi Bismillah")).toBeInTheDocument();
  });

  it("shows a long-press tip line under the grid", async () => {
    renderDashboard();
    expect(
      await screen.findByText(/tahan lama tombol Unduh untuk menyimpan berkas PDF/),
    ).toBeInTheDocument();
  });
});
