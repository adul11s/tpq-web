import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { KelasTabs } from "@/components/landing/KelasTabs";
import type { ClassDetail } from "@/lib/types/class";

const CLASS_DETAILS: ClassDetail[] = [
  {
    id: 1,
    code: "PAUD",
    slug: "paud",
    name: "PAUD Qur'ani",
    nameEn: null,
    ageMin: 3,
    ageMax: 4,
    description: "Program anak usia dini.",
    descriptionEn: null,
    hours: "07.30–10.00",
    capacity: "12 anak",
    fees: 150000,
    curriculum: [],
    schedule: [],
  },
  {
    id: 2,
    code: "TK",
    slug: "tk",
    name: "TK Qur'ani",
    nameEn: null,
    ageMin: 5,
    ageMax: 6,
    description: "Program taman kanak-kanak.",
    descriptionEn: null,
    hours: "07.30–11.00",
    capacity: "15 anak",
    fees: 200000,
    curriculum: [],
    schedule: [],
  },
  {
    id: 3,
    code: "TPA",
    slug: "tpa",
    name: "TPA Qur'ani",
    nameEn: null,
    ageMin: 7,
    ageMax: 12,
    description: "Program tahsin.",
    descriptionEn: null,
    hours: "15.00–17.00",
    capacity: "20 anak",
    fees: 200000,
    curriculum: [],
    schedule: [],
  },
];

function renderTabs(props?: { lang?: "id" | "en"; classes?: ClassDetail[]; whatsapp?: string }) {
  return render(
    <KelasTabs
      lang={props?.lang ?? "id"}
      classes={props?.classes ?? []}
      whatsapp={props?.whatsapp}
    />,
  );
}

describe("KelasTabs", () => {
  it("shows the PAUD panel by default", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: /PAUD/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: /PAUD/ })).toBeVisible();
    expect(screen.queryByRole("tabpanel", { name: /TK/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("tabpanel", { name: /TPA/ })).not.toBeInTheDocument();
  });

  it("switches panels and aria-selected when a tab is clicked", () => {
    renderTabs();
    fireEvent.click(screen.getByRole("tab", { name: /TK/ }));
    expect(screen.getByRole("tab", { name: /TK/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /PAUD/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByRole("tabpanel", { name: /TK/ })).toBeVisible();
    expect(screen.queryByRole("tabpanel", { name: /PAUD/ })).not.toBeInTheDocument();
  });

  it("links the CTA to the contact page as fallback when no classes are provided", () => {
    renderTabs();
    fireEvent.click(screen.getByRole("tab", { name: /TK/ }));
    expect(screen.getByRole("link", { name: /Daftar ke TK/ })).toHaveAttribute(
      "href",
      "/kontak",
    );
  });

  it("derives ages, fees, and the description from the API classes", () => {
    renderTabs({ classes: CLASS_DETAILS });
    expect(screen.getByText("Program anak usia dini.")).toBeInTheDocument();
    expect(screen.getByText("Rp 150.000")).toBeInTheDocument();
  });

  it("cross-links each panel CTA to the /kelas/{code} page when classes are provided", () => {
    renderTabs({ classes: CLASS_DETAILS });
    fireEvent.click(screen.getByRole("tab", { name: /TPA/ }));
    expect(screen.getByRole("link", { name: /Daftar ke TPA/ })).toHaveAttribute(
      "href",
      "/kelas/tpa",
    );
  });

  it("uses settings.whatsapp via waLink for the chat CTA", () => {
    renderTabs({ classes: CLASS_DETAILS, whatsapp: "628999999999" });
    expect(screen.getByRole("link", { name: /Chat WhatsApp/ })).toHaveAttribute(
      "href",
      "https://wa.me/628999999999",
    );
  });

  it("hides the chat link when no whatsapp number is provided", () => {
    renderTabs({ classes: CLASS_DETAILS });
    expect(screen.queryByRole("link", { name: /Chat WhatsApp/ })).toBeNull();
  });
});

describe("KelasTabs keyboard navigation (I4 ARIA tabs pattern)", () => {
  it("moves focus and selection with ArrowRight / ArrowLeft and wraps", () => {
    renderTabs();

    const paud = screen.getByRole("tab", { name: /PAUD/ });
    const tk = screen.getByRole("tab", { name: /TK/ });
    const tpa = screen.getByRole("tab", { name: /TPA/ });

    expect(paud).toHaveAttribute("tabindex", "0");
    expect(tk).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(tk).toHaveFocus();
    expect(tk).toHaveAttribute("aria-selected", "true");
    expect(tk).toHaveAttribute("tabindex", "0");
    expect(paud).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel", { name: /TK/ })).toBeVisible();

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(tpa).toHaveFocus();
    expect(tpa).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(paud).toHaveFocus();
    expect(paud).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowLeft" });
    expect(tpa).toHaveFocus();
    expect(tpa).toHaveAttribute("aria-selected", "true");
  });

  it("jumps to the first/last tab with Home and End", () => {
    renderTabs();

    const paud = screen.getByRole("tab", { name: /PAUD/ });
    const tpa = screen.getByRole("tab", { name: /TPA/ });

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "End" });
    expect(tpa).toHaveFocus();
    expect(tpa).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "Home" });
    expect(paud).toHaveFocus();
    expect(paud).toHaveAttribute("aria-selected", "true");
  });
});
