import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  server,
  adminMeAs,
  contentListHandler,
  contentListError,
  contentPreviewHandler,
  contentPublishHandler,
  contentArchiveHandler,
} from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import PersetujuanPage from "../src/app/admin/persetujuan/page";

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/persetujuan",
}));

const CLASS_DRAFT: Record<string, unknown> = {
  id: 1,
  code: "TK",
  name: "TK Qur'ani Bintang",
  status: "draft",
  created_by: 3,
  created_at: "2026-08-01T08:00:00Z",
};

const RESOURCE_DRAFT: Record<string, unknown> = {
  id: 2,
  title: "Materi Baca Iqro",
  status: "draft",
  created_by: 4,
  created_at: "2026-08-02T08:00:00Z",
};

const FAQ_PUBLISHED: Record<string, unknown> = {
  id: 3,
  question: "FAQ sudah publik",
  status: "published",
  created_at: "2026-08-03T08:00:00Z",
};

const PAGE_DRAFT: Record<string, unknown> = {
  id: 4,
  title_id: "Halaman Profil",
  status: "draft",
  created_at: "2026-08-04T08:00:00Z",
};

function storeHandlers(
  store: Record<string, Record<string, unknown>[]>,
  onList?: (entity: string) => void
) {
  return Object.entries(store).map(([entity, rows]) =>
    contentListHandler(entity, rows, () => onList?.(entity))
  );
}

const EMPTY_STORE: Record<string, Record<string, unknown>[]> = {
  classes: [],
  resources: [],
  prayer_guides: [],
  pages: [],
  teachers: [],
  testimonials: [],
  faqs: [],
};

function renderPage() {
  return render(
    <SessionProvider>
      <PersetujuanPage />
    </SessionProvider>
  );
}

describe("Persetujuan approval queue", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockReplace.mockClear();
  });

  it("shows only draft rows across entities, newest first, via ?status=draft", async () => {
    const queries: URLSearchParams[] = [];
    server.use(
      contentListHandler("classes", [CLASS_DRAFT], (params) =>
        queries.push(params)
      ),
      contentListHandler("resources", [RESOURCE_DRAFT, FAQ_PUBLISHED], (params) =>
        queries.push(params)
      ),
      contentListHandler("prayer_guides", [], (params) => queries.push(params)),
      contentListHandler("pages", [PAGE_DRAFT], (params) => queries.push(params)),
      contentListHandler("teachers", [], (params) => queries.push(params)),
      contentListHandler("testimonials", [], (params) => queries.push(params)),
      contentListHandler("faqs", [], (params) => queries.push(params))
    );
    renderPage();

    await screen.findByText("TK");
    expect(screen.getByText("Materi Baca Iqro")).toBeInTheDocument();
    expect(screen.getByText("Halaman Profil")).toBeInTheDocument();
    expect(screen.queryByText("FAQ sudah publik")).not.toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Kelas")).toBeInTheDocument();
    expect(within(table).getByText("Materi")).toBeInTheDocument();
    expect(within(table).getByText("3")).toBeInTheDocument();

    await waitFor(() => expect(queries).toHaveLength(7));
    for (const params of queries) {
      expect(params.get("status")).toBe("draft");
    }

    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Halaman Profil")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Materi Baca Iqro")).toBeInTheDocument();
    expect(within(rows[3]).getByText("TK")).toBeInTheDocument();
  });

  it("publishes a draft via POST with CSRF header, then the row disappears after refetch", async () => {
    const onPublish = vi.fn();
    const store: Record<string, Record<string, unknown>[]> = {
      ...EMPTY_STORE,
      classes: [CLASS_DRAFT],
    };
    server.use(
      ...storeHandlers(store),
      contentPublishHandler("classes", (request) => {
        onPublish(request);
        store.classes.length = 0;
      })
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("TK");
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));

    await waitFor(() => expect(onPublish).toHaveBeenCalledTimes(1));
    const request = onPublish.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe(
      "/api/admin/classes/1/publish"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");

    await waitFor(() =>
      expect(
        screen.queryByText("Tidak ada konten menunggu persetujuan.")
      ).toBeInTheDocument()
    );
    expect(screen.queryByText("TK")).not.toBeInTheDocument();
  });

  it("archives a draft via POST with CSRF header, then the row disappears", async () => {
    const onArchive = vi.fn();
    const store: Record<string, Record<string, unknown>[]> = {
      ...EMPTY_STORE,
      resources: [RESOURCE_DRAFT],
    };
    server.use(
      ...storeHandlers(store),
      contentArchiveHandler("resources", (request) => {
        onArchive(request);
        store.resources.length = 0;
      })
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Materi Baca Iqro");
    await user.click(screen.getByRole("button", { name: "Arsipkan" }));

    await waitFor(() => expect(onArchive).toHaveBeenCalledTimes(1));
    const request = onArchive.mock.calls[0][0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe(
      "/api/admin/resources/2/archive"
    );
    expect(request.headers.get("x-csrf-token")).toBe("abc123");

    await waitFor(() =>
      expect(screen.queryByText("Materi Baca Iqro")).not.toBeInTheDocument()
    );
  });

  it("opens the preview route data read-only in the modal", async () => {
    server.use(
      contentListHandler("classes", [CLASS_DRAFT]),
      contentListHandler("resources", []),
      contentListHandler("prayer_guides", []),
      contentListHandler("pages", []),
      contentListHandler("teachers", []),
      contentListHandler("testimonials", []),
      contentListHandler("faqs", []),
      contentPreviewHandler("classes", {
        ...CLASS_DRAFT,
        description: "Kelas taman kanak-kanak",
      })
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("TK");
    await user.click(screen.getByRole("button", { name: "Pratinjau" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Pratinjau: TK")).toBeInTheDocument();
    expect(
      within(dialog).getByText("description")
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Kelas taman kanak-kanak")
    ).toBeInTheDocument();
  });

  it("filters the queue by entity via the select", async () => {
    const listCalls: string[] = [];
    server.use(
      ...storeHandlers(
        {
          ...EMPTY_STORE,
          classes: [CLASS_DRAFT],
          resources: [RESOURCE_DRAFT],
          pages: [PAGE_DRAFT],
        },
        (entity) => listCalls.push(entity)
      )
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("TK");
    await user.selectOptions(screen.getByLabelText("Entitas"), "classes");
    await waitFor(() =>
      expect(listCalls.filter((entity) => entity === "classes")).toHaveLength(2)
    );
    expect(
      listCalls.filter((entity) => entity === "resources")
    ).toHaveLength(1);
    expect(screen.queryByText("Materi Baca Iqro")).not.toBeInTheDocument();
    expect(screen.queryByText("Halaman Profil")).not.toBeInTheDocument();
    expect(screen.getByText("TK")).toBeInTheDocument();
  });

  it("still renders available rows with a warning when one entity fails to load", async () => {
    server.use(
      contentListHandler("classes", [CLASS_DRAFT]),
      contentListHandler("resources", [RESOURCE_DRAFT]),
      contentListHandler("prayer_guides", []),
      contentListHandler("pages", []),
      contentListError("teachers"),
      contentListHandler("testimonials", []),
      contentListHandler("faqs", [])
    );
    renderPage();

    await screen.findByText("TK");
    expect(screen.getByText("Materi Baca Iqro")).toBeInTheDocument();
    expect(
      screen.getByText(/Sebagian data gagal dimuat: Guru/i)
    ).toBeInTheDocument();
  });

  it("redirects content_manager away from the page and hides actions", async () => {
    server.use(adminMeAs("content_manager"));
    renderPage();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    expect(
      screen.getByText("Halaman ini khusus untuk admin.")
    ).toBeInTheDocument();
  });
});
