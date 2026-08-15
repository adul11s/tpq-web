import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DoaCatalog } from "@/components/doa/DoaCatalog";
import type { PrayerGuide } from "@/lib/types/prayerGuide";

const API_GUIDES: PrayerGuide[] = [
  {
    id: 1,
    occasion: "Masuk masjid",
    occasionSlug: "masuk-masjid",
    arabicText: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahummaf-tah lii abwaaba rahmatik",
    meaningId: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
    meaningEn: "O Allah, open for me the gates of Your mercy.",
    sortOrder: 0,
  },
  {
    id: 2,
    occasion: "Sebelum tidur",
    occasionSlug: "sebelum-tidur",
    arabicText: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ",
    transliteration: "Bismika allahumma ahyaa wa amuut",
    meaningId: "Dengan nama-Mu ya Allah, aku hidup dan aku mati.",
    meaningEn: "In Your name, O Allah, I live and I die.",
    sortOrder: 1,
  },
];

describe("DoaCatalog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("shows all 8 prayers by default with the Semua Doa chip pressed", () => {
    render(<DoaCatalog lang="id" />);
    expect(screen.getByRole("button", { name: /Semua Doa/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByRole("article")).toHaveLength(9);
  });

  it("filters the grid when a category chip is pressed", () => {
    render(<DoaCatalog lang="id" />);
    fireEvent.click(screen.getByRole("button", { name: /Sebelum Tidur/ }));
    expect(screen.getByRole("button", { name: /Sebelum Tidur/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("Doa Sebelum Tidur")).toBeInTheDocument();
    expect(screen.queryByText("Doa Sesudah Makan")).not.toBeInTheDocument();
  });

  it("shows a share toast with a WhatsApp link after sharing", () => {
    render(<DoaCatalog lang="id" />);
    fireEvent.click(screen.getByRole("button", { name: /Doa Bangun Tidur/ }));
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Terima kasih!");
    const openLink = toast.querySelector("a");
    expect(openLink?.href).toContain("https://wa.me/?text=");
    expect(decodeURIComponent(openLink?.href ?? "")).toContain("Doa Bangun Tidur");
  });

  it("dismisses the toast after 6 seconds", () => {
    render(<DoaCatalog lang="id" />);
    fireEvent.click(screen.getByRole("button", { name: /Doa Bangun Tidur/ }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("honors the ?occasion search param by filtering and focusing the matching card", () => {
    window.history.pushState({}, "", "/doa?occasion=sebelum-makan");
    render(<DoaCatalog lang="id" />);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(
      screen.getByRole("button", { name: /Makan & Minum/ }),
    ).toHaveAttribute("aria-pressed", "true");
    const card = document.getElementById("doa-card-doa-sebelum-makan");
    expect(card).toHaveFocus();
    expect(screen.queryByText("Doa Bangun Tidur")).not.toBeInTheDocument();
  });

  it("renders API guides instead of hardcoded cards when guides are provided", () => {
    render(<DoaCatalog lang="id" guides={API_GUIDES} />);
    expect(screen.getAllByText("Masuk masjid").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Sebelum tidur")).toBeInTheDocument();
    expect(screen.queryByText("Doa Sesudah Makan")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/berkahilah rezeki-Mu untuk kami/i),
    ).not.toBeInTheDocument();
  });

  it("matches ?occasion= against API guide slugs when guides are provided", () => {
    window.history.pushState({}, "", "/doa?occasion=masuk-masjid");
    render(<DoaCatalog lang="id" guides={API_GUIDES} />);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    const card = document.getElementById("doa-card-doa-masuk-masjid");
    expect(card).toHaveFocus();
    expect(screen.queryByText("Sebelum tidur")).not.toBeInTheDocument();
  });

  it("shows a graceful note for an unmatched ?occasion= param", () => {
    window.history.pushState({}, "", "/doa?occasion=tidak-ada");
    render(<DoaCatalog lang="id" guides={API_GUIDES} />);
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(
      screen.getByText(/Doa untuk momen ini belum tersedia/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Masuk masjid").length).toBeGreaterThanOrEqual(2);
  });
});
