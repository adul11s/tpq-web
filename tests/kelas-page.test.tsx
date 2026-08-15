import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server, API_BASE } from "./msw-server";
import KelasPage from "@/app/[lang]/kelas/page";

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
    name_en: "Qur'anic Early Childhood",
    age_min: 3,
    age_max: 4,
    description: "Program anak usia dini dari API.",
    description_en: "Early childhood program from API.",
    hours: "Senin–Jumat 07.30–10.00",
    capacity: "12 anak",
  },
  {
    id: 2,
    code: "TK",
    name: "TK Qur'ani",
    name_en: "Qur'anic Kindergarten",
    age_min: 5,
    age_max: 6,
    description: "Program taman kanak-kanak dari API.",
    description_en: "Kindergarten program from API.",
    hours: "Senin–Jumat 07.30–11.00",
    capacity: "15 anak",
  },
  {
    id: 3,
    code: "TPA",
    name: "TPA Qur'ani",
    name_en: "Qur'anic Study Group",
    age_min: 7,
    age_max: 12,
    description: "Program tahsin dari API.",
    description_en: "Tahsin program from API.",
    hours: "Senin–Jumat 15.00–17.00",
    capacity: "20 anak",
  },
];

const CLASS_DETAILS: Record<string, Record<string, unknown>> = {
  PAUD: {
    ...CLASS_ROWS[0],
    fees: "150000",
    curriculum: [
      {
        aspect: "quran_targets",
        title: "Mengenal huruf hijaiyah",
        title_en: "Recognize hijaiyah letters",
        description: null,
        description_en: null,
        sort_order: 0,
      },
    ],
    schedule: [
      {
        day_name: "Senin",
        start_time: "08:00",
        end_time: "09:00",
        activity: "Doa bersama & iqro",
        sort_order: 0,
      },
    ],
  },
  TK: {
    ...CLASS_ROWS[1],
    fees: "200000",
    curriculum: [],
    schedule: [],
  },
  TPA: {
    ...CLASS_ROWS[2],
    fees: "200000",
    curriculum: [],
    schedule: [],
  },
};

function kelasHandlers() {
  return [
    http.get(`${API_BASE}/classes`, () => HttpResponse.json(CLASS_ROWS)),
    http.get(`${API_BASE}/classes/:code`, ({ params }) => {
      const code = String(params.code).toUpperCase();
      return HttpResponse.json(CLASS_DETAILS[code]);
    }),
    http.get(`${API_BASE}/site-settings`, () => HttpResponse.json(SETTINGS)),
  ];
}

describe("Kelas page (I2 API-driven tabs)", () => {
  it("derives ages, fees, description, and schedule from the API rows", async () => {
    server.use(...kelasHandlers());
    render(await KelasPage({ params: Promise.resolve({ lang: "id" }) }));

    expect(await screen.findByText("Program anak usia dini dari API.")).toBeInTheDocument();
    expect(screen.getByText("Doa bersama & iqro")).toBeInTheDocument();
    expect(screen.getByText("Mengenal huruf hijaiyah")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /PAUD/ }));
    expect(screen.getByText("Rp 150.000")).toBeInTheDocument();
  });

  it("cross-links each panel CTA to the bilingual /kelas/{code} page", async () => {
    server.use(...kelasHandlers());
    render(await KelasPage({ params: Promise.resolve({ lang: "id" }) }));

    fireEvent.click(screen.getByRole("tab", { name: /TK/ }));
    expect(screen.getByRole("link", { name: /Daftar ke TK/ })).toHaveAttribute(
      "href",
      "/kelas/tk",
    );
  });

  it("links the WhatsApp chat CTA to settings.whatsapp via waLink", async () => {
    server.use(...kelasHandlers());
    render(await KelasPage({ params: Promise.resolve({ lang: "id" }) }));

    const chatLink = screen.getByRole("link", { name: /Chat WhatsApp/ });
    expect(chatLink).toHaveAttribute("href", "https://wa.me/628999999999");
  });
});
