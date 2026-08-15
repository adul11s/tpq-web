import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, API_BASE } from "./msw-server";
import DoaPage from "@/app/[lang]/doa/page";

const API_GUIDES = [
  {
    id: 1,
    occasion: "Masuk masjid",
    occasion_slug: "masuk-masjid",
    arabic_text: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahummaf-tah lii abwaaba rahmatik",
    meaning_id: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
    meaning_en: "O Allah, open for me the gates of Your mercy.",
    sort_order: 0,
  },
  {
    id: 2,
    occasion: "Sebelum makan",
    occasion_slug: "sebelum-makan",
    arabic_text: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    meaning_id: "Dengan nama Allah.",
    meaning_en: "In the name of Allah.",
    sort_order: 1,
  },
];

function guidesHandler() {
  return http.get(`${API_BASE}/prayer-guides`, () =>
    HttpResponse.json(API_GUIDES),
  );
}

function guidesErrorHandler() {
  return http.get(`${API_BASE}/prayer-guides`, () =>
    HttpResponse.json({ error: "boom" }, { status: 500 }),
  );
}

async function renderPage(lang: "id" | "en" = "id") {
  return render(await DoaPage({ params: Promise.resolve({ lang }) }));
}

describe("Doa page (I2 API-driven catalog)", () => {
  it("renders prayer guides from the API in the catalog", async () => {
    server.use(guidesHandler());
    await renderPage();
    expect(screen.getAllByText("Masuk masjid").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Sebelum makan")).toBeInTheDocument();
    expect(screen.queryByText("Doa Sesudah Makan")).not.toBeInTheDocument();
  });

  it("filters and focuses the card matching an API ?occasion= slug", async () => {
    server.use(guidesHandler());
    window.history.pushState({}, "", "/doa?occasion=masuk-masjid");
    await renderPage();
    await waitFor(() =>
      expect(
        document.getElementById("doa-card-doa-masuk-masjid"),
      ).toHaveFocus(),
    );
    expect(
      screen.getByRole("button", { name: /Pagi & Petang/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a graceful note when ?occasion= does not match any guide", async () => {
    server.use(guidesHandler());
    window.history.pushState({}, "", "/doa?occasion=tidak-ada");
    await renderPage();
    expect(
      await screen.findByText(/Doa untuk momen ini belum tersedia/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Masuk masjid").length).toBeGreaterThanOrEqual(2);
  });

  it("falls back to the hardcoded catalog when the API is unavailable", async () => {
    server.use(guidesErrorHandler());
    await renderPage();
    expect(screen.getAllByText("Doa Sebelum Makan").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Doa Bangun Tidur")).toBeInTheDocument();
  });
});
