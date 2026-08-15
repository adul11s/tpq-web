import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DoaCatalog } from "@/components/doa/DoaCatalog";

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
});