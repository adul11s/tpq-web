import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, API_BASE } from "./msw-server";
import HomePage from "@/app/[lang]/page";

const SETTINGS = {
  address: "Jl. Pendidikan No. 1",
  map_link: "https://maps.example.id/tpq",
  phone: "0812-3456-7890",
  whatsapp: "628999999999",
  hours: "Senin–Sabtu 07.30–16.30 WIB",
  facebook: null,
  instagram: null,
  privacy_policy_url: "/privacy-policy",
  privacy_policy_version: "1.0",
};

const CLASS_ROWS = [
  {
    id: 1,
    code: "PAUD",
    name: "PAUD Qur'ani",
    name_en: null,
    age_min: 3,
    age_max: 4,
    description: null,
    description_en: null,
    hours: null,
    capacity: null,
  },
];

function homeHandlers() {
  return [
    http.get(`${API_BASE}/classes`, () => HttpResponse.json(CLASS_ROWS)),
    http.get(`${API_BASE}/site-settings`, () => HttpResponse.json(SETTINGS)),
  ];
}

describe("Home page CTA band (I3 WhatsApp from settings)", () => {
  it("links the WhatsApp chat CTA to settings.whatsapp via waLink", async () => {
    server.use(...homeHandlers());
    render(await HomePage({ params: Promise.resolve({ lang: "id" }) }));

    const chatLink = screen.getByRole("link", { name: "Chat WhatsApp" });
    expect(chatLink).toHaveAttribute("href", "https://wa.me/628999999999");
    expect(chatLink).toHaveAttribute("target", "_blank");
  });
});

describe("Home page bilingual stragglers (I5)", () => {
  it("localizes the testimonial star rating aria-label in EN mode", async () => {
    server.use(...homeHandlers());
    render(await HomePage({ params: Promise.resolve({ lang: "en" }) }));

    expect(screen.getAllByLabelText("5 out of 5 stars").length).toBe(3);
  });

  it("keeps the ID star rating aria-label in ID mode", async () => {
    server.use(...homeHandlers());
    render(await HomePage({ params: Promise.resolve({ lang: "id" }) }));

    expect(screen.getAllByLabelText("5 dari 5 bintang").length).toBe(3);
  });

  it("shows EN category labels on the download tiles in EN mode", async () => {
    server.use(...homeHandlers());
    render(await HomePage({ params: Promise.resolve({ lang: "en" }) }));

    expect(screen.getByText("Daily Prayers")).toBeInTheDocument();
    expect(screen.getByText("Calligraphy")).toBeInTheDocument();
    expect(screen.getByText("Coloring")).toBeInTheDocument();
    expect(screen.queryByText("Kaligrafi")).not.toBeInTheDocument();
  });
});
