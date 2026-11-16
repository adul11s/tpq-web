import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ApiError } from "@/lib/api/client";

vi.mock("@/lib/data/resources", () => ({ fetchResourceBySlug: vi.fn() }));
vi.mock("@/lib/data/classes", () => ({ fetchClassByCode: vi.fn() }));
vi.mock("@/lib/data/pages", () => ({
  fetchPageBySlug: vi.fn(),
  fetchSiteSettings: vi.fn(async () => ({})),
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
  useParams: () => ({ lang: "en" }),
}));

import ResourcePage, { generateMetadata as resourceMetadata } from "@/app/[lang]/resources/[slug]/page";
import ClassPage, { generateMetadata as classMetadata } from "@/app/[lang]/kelas/[code]/page";
import PrivacyPage, { generateMetadata as privacyMetadata } from "@/app/[lang]/privacy-policy/page";
import PublicError from "@/app/[lang]/error";
import { fetchResourceBySlug } from "@/lib/data/resources";
import { fetchClassByCode } from "@/lib/data/classes";
import { fetchPageBySlug } from "@/lib/data/pages";
import { notFound } from "next/navigation";

const resourceParams = { params: Promise.resolve({ lang: "id", slug: "missing" }) };
const classParams = { params: Promise.resolve({ lang: "id", code: "missing" }) };
const privacyParams = { params: Promise.resolve({ lang: "id" }) };

beforeEach(() => vi.clearAllMocks());

describe.each([
  { name: "resource", fetch: fetchResourceBySlug, page: () => ResourcePage(resourceParams), metadata: () => resourceMetadata(resourceParams) },
  { name: "class", fetch: fetchClassByCode, page: () => ClassPage(classParams), metadata: () => classMetadata(classParams) },
  { name: "privacy", fetch: fetchPageBySlug, page: () => PrivacyPage(privacyParams), metadata: () => privacyMetadata(privacyParams) },
])("$name error handling", ({ fetch, page, metadata }) => {
  it("returns not-found only for an upstream 404", async () => {
    vi.mocked(fetch).mockRejectedValue(new ApiError(404, "Missing"));
    await expect(page()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledOnce();
  });

  it.each([new ApiError(500, "Unavailable"), new ApiError(0, "Offline")])(
    "propagates an outage to the retry boundary: %s", async (error) => {
      vi.mocked(fetch).mockRejectedValue(error);
      await expect(page()).rejects.toBe(error);
      await expect(metadata()).rejects.toBe(error);
      expect(notFound).not.toHaveBeenCalled();
    },
  );
});

it("offers a localized retry after an upstream failure", () => {
  const reset = vi.fn();
  render(<PublicError reset={reset} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load this page");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(reset).toHaveBeenCalledOnce();
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/en");
});
