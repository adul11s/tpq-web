import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RaporView } from "@/components/parent/RaporView";
import { ParentGate } from "@/components/parent/ParentGate";
import { ParentSessionProvider } from "@/lib/parent/session";
import {
  parentApi,
  type ParentChild,
  type ParentMe,
  type ParentRaporDownload,
  type ParentRaporMeta,
} from "@/lib/api/parent";
import { ApiError } from "@/lib/api/client";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const ME_OK: ParentMe = {
  ok: true,
  email: "ibu@example.com",
  full_name: "Ibu Siti Rahma",
  must_change_password: false,
};

const AISYAH: ParentChild = {
  student_id: 1,
  full_name: "Aisyah Putri",
  nis: "TPQ-2026-0001",
  class: "TK Qur'ani Bintang",
  academic_year: "2026/2027",
  rapor_periods: [
    { period_id: 2, semester: "ganjil", academic_year: "2026/2027" },
    { period_id: 1, semester: "genap", academic_year: "2025/2026" },
  ],
};

const RAPOR_META: ParentRaporMeta = {
  student_id: 1,
  rapor_period_id: 2,
  file_size: 1_234_567,
  finalized_at: "2026-08-10T08:00:00Z",
};

const DOWNLOAD: ParentRaporDownload = {
  download_url:
    "https://cdn.example.id/rapor-1-2.pdf?X-Amz-Signature=abc123",
  file_name: "rapor-aisyah-ganjil-2026-2027.pdf",
};

function renderRapor(lang: "id" | "en" = "id") {
  return render(
    <ParentSessionProvider>
      <ParentGate lang={lang}>
        <RaporView lang={lang} studentId={1} periodId={2} />
      </ParentGate>
    </ParentSessionProvider>
  );
}

describe("RaporView", () => {
  beforeEach(() => {
    mockPush.mockClear();
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);
    vi.spyOn(parentApi, "children").mockResolvedValue({ children: [AISYAH] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders metadata and both actions once the download URL resolves", async () => {
    vi.spyOn(parentApi, "rapor").mockResolvedValue(RAPOR_META);
    vi.spyOn(parentApi, "raporDownload").mockResolvedValue(DOWNLOAD);
    renderRapor("id");

    expect(
      await screen.findByRole("heading", { name: "Unduh Rapor" }),
    ).toBeInTheDocument();

    const lihat = await screen.findByRole("link", { name: "Lihat" });
    expect(lihat).toHaveAttribute("href", DOWNLOAD.download_url);
    expect(lihat).toHaveAttribute("target", "_blank");
    expect(lihat).toHaveAttribute("rel", "noopener noreferrer");

    const unduh = screen.getByRole("link", { name: "Unduh PDF" });
    expect(unduh).toHaveAttribute("href", DOWNLOAD.download_url);
    expect(unduh).toHaveAttribute("download", DOWNLOAD.file_name);

    expect(screen.getByText("Aisyah Putri")).toBeInTheDocument();
    expect(
      screen.getByText(/Ganjil 2026\/2027 · TK Qur'ani Bintang/),
    ).toBeInTheDocument();
    expect(screen.getByText("Ukuran file")).toBeInTheDocument();
    expect(screen.getByText("1,2 MB")).toBeInTheDocument();
    expect(screen.getByText("Diterbitkan")).toBeInTheDocument();
    expect(screen.getByText("10 Agustus 2026")).toBeInTheDocument();
  });

  it("shows Bukan anak Anda on 403 without a retry button", async () => {
    vi.spyOn(parentApi, "rapor").mockRejectedValue(
      new ApiError(403, "Bukan anak Anda"),
    );
    vi.spyOn(parentApi, "raporDownload").mockRejectedValue(
      new ApiError(403, "Bukan anak Anda"),
    );
    renderRapor("id");

    expect(await screen.findByText(/Bukan anak Anda/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Coba Lagi" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Lihat" })).not.toBeInTheDocument();
  });

  it("shows Rapor belum tersedia on 404 without a retry button", async () => {
    vi.spyOn(parentApi, "rapor").mockRejectedValue(
      new ApiError(404, "Rapor belum tersedia"),
    );
    vi.spyOn(parentApi, "raporDownload").mockRejectedValue(
      new ApiError(404, "Rapor belum tersedia"),
    );
    renderRapor("id");

    expect(
      await screen.findByText("Rapor belum tersedia"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Coba Lagi" }),
    ).not.toBeInTheDocument();
  });

  it("shows a generic error and refetches on retry", async () => {
    const raporSpy = vi
      .spyOn(parentApi, "rapor")
      .mockRejectedValueOnce(new ApiError(500, "Internal server error"))
      .mockResolvedValueOnce(RAPOR_META);
    const downloadSpy = vi
      .spyOn(parentApi, "raporDownload")
      .mockRejectedValueOnce(new ApiError(500, "Internal server error"))
      .mockResolvedValueOnce(DOWNLOAD);
    const user = userEvent.setup();
    renderRapor("id");

    expect(
      await screen.findByText("Terjadi kesalahan. Coba lagi nanti."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Coba Lagi" }));

    expect(await screen.findByRole("link", { name: "Lihat" })).toBeInTheDocument();
    expect(raporSpy).toHaveBeenCalledTimes(2);
    expect(downloadSpy).toHaveBeenCalledTimes(2);
  });

  it("lang-prefixes the back link to the children list", async () => {
    vi.spyOn(parentApi, "rapor").mockResolvedValue(RAPOR_META);
    vi.spyOn(parentApi, "raporDownload").mockResolvedValue(DOWNLOAD);
    renderRapor("id");

    await screen.findByRole("link", { name: "Lihat" });
    expect(
      screen.getByRole("link", { name: "Kembali ke Anak Saya" }),
    ).toHaveAttribute("href", "/parent/anak");
  });

  it("lang-prefixes the back link for the en locale", async () => {
    vi.spyOn(parentApi, "rapor").mockResolvedValue(RAPOR_META);
    vi.spyOn(parentApi, "raporDownload").mockResolvedValue(DOWNLOAD);
    renderRapor("en");

    await screen.findByRole("link", { name: "View" });
    expect(
      screen.getByRole("link", { name: "Back to My Children" }),
    ).toHaveAttribute("href", "/en/parent/anak");
  });

  it("shows a loading skeleton while fetching the report", async () => {
    let resolveRapor: (value: ParentRaporMeta) => void = () => {};
    let resolveDownload: (value: ParentRaporDownload) => void = () => {};
    vi.spyOn(parentApi, "rapor").mockReturnValue(
      new Promise((resolve) => {
        resolveRapor = resolve;
      }),
    );
    vi.spyOn(parentApi, "raporDownload").mockReturnValue(
      new Promise((resolve) => {
        resolveDownload = resolve;
      }),
    );
    renderRapor("id");

    expect(
      await screen.findByRole("status", { name: "Memuat data rapor" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Lihat" })).not.toBeInTheDocument();

    resolveRapor(RAPOR_META);
    resolveDownload(DOWNLOAD);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Lihat" })).toBeInTheDocument(),
    );
  });

  it("still shows the actions when the children fetch fails, with a generic title", async () => {
    vi.spyOn(parentApi, "rapor").mockResolvedValue(RAPOR_META);
    vi.spyOn(parentApi, "raporDownload").mockResolvedValue(DOWNLOAD);
    vi.spyOn(parentApi, "children").mockRejectedValue(
      new ApiError(500, "Internal server error"),
    );
    renderRapor("id");

    expect(await screen.findByRole("link", { name: "Lihat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Unduh PDF" })).toBeInTheDocument();
    expect(screen.queryByText("Aisyah Putri")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rapor" })).toBeInTheDocument();
  });
});
