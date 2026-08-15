import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, API_BASE } from "./msw-server";
import KontakPage from "@/app/[lang]/kontak/page";

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

function kontakHandlers(mapLink: string | null) {
  return [
    http.get(`${API_BASE}/classes`, () => HttpResponse.json(CLASS_ROWS)),
    http.get(`${API_BASE}/site-settings`, () =>
      HttpResponse.json({
        address: "Jl. Pendidikan No. 1",
        map_link: mapLink,
        phone: "0812-3456-7890",
        whatsapp: "6281234567890",
        hours: "Senin–Sabtu 07.30–16.30 WIB",
        facebook: null,
        instagram: null,
        privacy_policy_url: "/privacy-policy",
        privacy_policy_version: "1.0",
      }),
    ),
  ];
}

describe("Kontak map card (minor: no href='#' placeholder)", () => {
  it("renders a non-link placeholder when mapLink is null", async () => {
    server.use(...kontakHandlers(null));
    render(await KontakPage({ params: Promise.resolve({ lang: "id" }) }));

    expect(
      screen.getByText(/Peta interaktif akan dipasang di sini/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Buka lokasi di peta/ })).toBeNull();
    expect(document.querySelector('a[href="#"]')).toBeNull();
  });

  it("links to the real map URL when mapLink is present", async () => {
    server.use(...kontakHandlers("https://maps.example.id/tpq"));
    render(await KontakPage({ params: Promise.resolve({ lang: "id" }) }));

    expect(
      screen.getByRole("link", { name: /Buka lokasi di peta/ }),
    ).toHaveAttribute("href", "https://maps.example.id/tpq");
  });
});
