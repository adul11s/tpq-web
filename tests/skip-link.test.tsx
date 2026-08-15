import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipLink } from "@/components/landing/SkipLink";

describe("SkipLink", () => {
  it("renders a link to the main landmark with the ID label", () => {
    render(<SkipLink lang="id" />);
    const link = screen.getByRole("link", { name: "Lewati ke konten utama" });
    expect(link).toHaveAttribute("href", "#main");
  });

  it("uses the English label for the en locale", () => {
    render(<SkipLink lang="en" />);
    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#main");
  });
});