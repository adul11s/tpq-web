import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Navbar } from "@/components/landing/Navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens and closes the mobile menu from the hamburger button", () => {
    render(<Navbar lang="id" />);
    const toggle = screen.getByRole("button", { name: "Buka menu" });
    expect(toggle).toHaveAttribute("aria-controls", "mobile-menu");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Tutup menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Tutup menu" }));
    expect(screen.getByRole("button", { name: "Buka menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("marks the current page link with aria-current", () => {
    render(<Navbar lang="id" />);
    const homeLink = screen.getByRole("link", { name: "Beranda" });
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});