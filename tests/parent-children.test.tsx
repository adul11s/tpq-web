import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChildrenList } from "@/components/parent/ChildrenList";
import { ParentGate } from "@/components/parent/ParentGate";
import { ParentSessionProvider } from "@/lib/parent/session";
import {
  parentApi,
  type ParentChild,
  type ParentMe,
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

const RAYYAN: ParentChild = {
  student_id: 2,
  full_name: "Muhammad Rayyan",
  nis: "TPQ-2026-0002",
  class: "TPA Qur'ani Bintang",
  academic_year: "2026/2027",
  rapor_periods: [],
};

function renderChildren(lang: "id" | "en" = "id") {
  return render(
    <ParentSessionProvider>
      <ParentGate lang={lang}>
        <ChildrenList lang={lang} />
      </ParentGate>
    </ParentSessionProvider>
  );
}

describe("ChildrenList", () => {
  beforeEach(() => {
    mockPush.mockClear();
    vi.spyOn(parentApi, "me").mockResolvedValue(ME_OK);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a card per child with avatar initial, name, class and NIS", async () => {
    vi.spyOn(parentApi, "children").mockResolvedValue({
      children: [AISYAH, RAYYAN],
    });
    renderChildren("id");

    expect(
      await screen.findByRole("heading", { name: "Anak Saya" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Aisyah Putri")
    ).toBeInTheDocument();
    expect(screen.getByText("Muhammad Rayyan")).toBeInTheDocument();
    expect(
      screen.getByText(/TK Qur'ani Bintang · NIS TPQ-2026-0001/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/TPA Qur'ani Bintang · NIS TPQ-2026-0002/),
    ).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("links Lihat Rapor to the latest rapor period when one exists", async () => {
    vi.spyOn(parentApi, "children").mockResolvedValue({ children: [AISYAH] });
    renderChildren("id");

    const link = await screen.findByRole("link", { name: "Lihat Rapor" });
    expect(link).toHaveAttribute("href", "/parent/rapor/1/2");
  });

  it("lang-prefixes the rapor link for the en locale", async () => {
    vi.spyOn(parentApi, "children").mockResolvedValue({ children: [AISYAH] });
    renderChildren("en");

    const link = await screen.findByRole("link", { name: "View Report" });
    expect(link).toHaveAttribute("href", "/en/parent/rapor/1/2");
  });

  it("shows no Lihat Rapor link when the child has no rapor yet", async () => {
    vi.spyOn(parentApi, "children").mockResolvedValue({ children: [RAYYAN] });
    renderChildren("id");

    expect(await screen.findByText("Muhammad Rayyan")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Lihat Rapor" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Rapor belum tersedia")).toBeInTheDocument();
  });

  it("shows the empty-state copy when no children are connected", async () => {
    vi.spyOn(parentApi, "children").mockResolvedValue({ children: [] });
    renderChildren("id");

    expect(
      await screen.findByText("Belum ada anak terhubung"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Hubungi pihak sekolah/)).toBeInTheDocument();
  });

  it("shows the error state and refetches on retry", async () => {
    const childrenSpy = vi
      .spyOn(parentApi, "children")
      .mockRejectedValueOnce(new ApiError(500, "Internal server error"))
      .mockResolvedValueOnce({ children: [AISYAH] });
    const user = userEvent.setup();
    renderChildren("id");

    expect(
      await screen.findByText("Terjadi kesalahan. Coba lagi nanti."),
    ).toBeInTheDocument();
    expect(childrenSpy).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Coba Lagi" }));

    expect(await screen.findByText("Aisyah Putri")).toBeInTheDocument();
    expect(childrenSpy).toHaveBeenCalledTimes(2);
  });

  it("shows a loading skeleton while children are being fetched", async () => {
    let resolveChildren: (value: { children: ParentChild[] }) => void =
      () => {};
    vi.spyOn(parentApi, "children").mockReturnValue(
      new Promise((resolve) => {
        resolveChildren = resolve;
      }),
    );
    renderChildren("id");

    expect(
      await screen.findByRole("status", { name: "Memuat data anak" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Lihat Rapor" }),
    ).not.toBeInTheDocument();

    resolveChildren({ children: [AISYAH] });
    await waitFor(() =>
      expect(screen.getByText("Aisyah Putri")).toBeInTheDocument(),
    );
  });
});