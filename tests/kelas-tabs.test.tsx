import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { KelasTabs } from "@/components/landing/KelasTabs";

describe("KelasTabs", () => {
  it("shows the PAUD panel by default", () => {
    render(<KelasTabs lang="id" />);
    expect(screen.getByRole("tab", { name: /PAUD/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: /PAUD/ })).toBeVisible();
    expect(screen.queryByRole("tabpanel", { name: /TK/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("tabpanel", { name: /TPA/ })).not.toBeInTheDocument();
  });

  it("switches panels and aria-selected when a tab is clicked", () => {
    render(<KelasTabs lang="id" />);
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

  it("links the CTA to the contact page", () => {
    render(<KelasTabs lang="id" />);
    fireEvent.click(screen.getByRole("tab", { name: /TK/ }));
    expect(screen.getByRole("link", { name: /Daftar ke TK/ })).toHaveAttribute(
      "href",
      "/kontak",
    );
  });
});