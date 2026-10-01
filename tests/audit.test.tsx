import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  server,
  adminMeAs,
  usersListHandler,
  auditListHandler,
  auditCsvHandler,
} from "./msw-server";
import { SessionProvider } from "../src/lib/admin/session";
import AktivitasPage from "../src/app/admin/aktivitas/page";
import { menuForRole } from "../src/lib/admin/menu";
import type { AdminAuditRow, AdminUser } from "../src/lib/types/admin";

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/admin/aktivitas",
}));

const USERS: AdminUser[] = [
  {
    id: 1,
    email: "admin@tpq-qurani.example.id",
    full_name: "Ustadz Admin",
    role: "admin",
    is_active: true,
    has_2fa: true,
  },
  {
    id: 2,
    email: "konten@tpq-qurani.example.id",
    full_name: "Ustadzah Konten",
    role: "content_manager",
    is_active: true,
    has_2fa: false,
  },
];

const UA_LONG =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const AUDIT_ROWS: AdminAuditRow[] = [
  {
    id: 10,
    user_id: 2,
    action: "content_publish",
    entity_type: "prayer_guide",
    entity_id: 7,
    ip: "203.0.113.10",
    user_agent: UA_LONG,
    created_at: "2026-08-14T09:30:00Z",
  },
  {
    id: 9,
    user_id: 99,
    action: "login_success",
    entity_type: null,
    entity_id: null,
    ip: "198.51.100.22",
    user_agent: null,
    created_at: "2026-08-14T08:05:00Z",
  },
];

const AUDIT_META = { page: 1, page_size: 50, total: 2, total_pages: 1 };

function renderPage() {
  return render(
    <SessionProvider>
      <AktivitasPage />
    </SessionProvider>
  );
}

function localized(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("id-ID");
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

function rowOf(text: string): HTMLElement {
  return screen.getByRole("row", { name: new RegExp(text) });
}

function latestQuery(onQuery: ReturnType<typeof vi.fn>): URLSearchParams {
  return onQuery.mock.calls.at(-1)![0] as URLSearchParams;
}

describe("Aktivitas (audit log)", () => {
  beforeEach(() => {
    document.cookie = "tpq_csrf=abc123; path=/";
    mockReplace.mockClear();
  });

  it("renders rows with mapped action labels, user emails, entity, IP and localized timestamps", async () => {
    server.use(usersListHandler(USERS), auditListHandler(AUDIT_ROWS, AUDIT_META));
    renderPage();

    const published = await screen.findByRole("row", {
      name: /konten@/,
    });
    expect(
      within(published).getByText("konten@tpq-qurani.example.id")
    ).toBeInTheDocument();
    expect(within(published).getByText("Konten diterbitkan")).toBeInTheDocument();
    expect(
      within(published).getByText("prayer_guide · 7")
    ).toBeInTheDocument();
    expect(within(published).getByText("203.0.113.10")).toBeInTheDocument();
    expect(
      within(published).getByText(localized("2026-08-14T09:30:00Z"))
    ).toBeInTheDocument();
    expect(screen.queryByText("2026-08-14T09:30:00Z")).not.toBeInTheDocument();

    const loggedIn = rowOf("198.51.100.22");
    expect(within(loggedIn).getByText("Masuk")).toBeInTheDocument();
    expect(within(loggedIn).getByText("99")).toBeInTheDocument();
    expect(within(loggedIn).getAllByText("\u2014").length).toBe(2);

    const ua = screen.getByTitle(UA_LONG);
    expect(ua.textContent).not.toBe(UA_LONG);
    expect(ua.textContent).toMatch(/…$/);

    expect(
      screen.getByText(/50 aktivitas terbaru/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Muat ulang" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ekspor CSV" })
    ).toBeInTheDocument();
  });

  it("filters by action and user, firing ?action=content_publish and ?user_id=2", async () => {
    const onQuery = vi.fn();
    server.use(
      usersListHandler(USERS),
      auditListHandler(AUDIT_ROWS, AUDIT_META, onQuery)
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Konten diterbitkan");

    await user.selectOptions(screen.getByLabelText("Aksi"), "content_publish");
    await waitFor(() => {
      expect(latestQuery(onQuery).get("action")).toBe("content_publish");
    });
    expect(latestQuery(onQuery).get("page")).toBe("1");
    expect(latestQuery(onQuery).get("page_size")).toBe("50");

    await user.selectOptions(screen.getByLabelText("Pengguna"), "2");
    await waitFor(() => {
      expect(latestQuery(onQuery).get("user_id")).toBe("2");
    });
    expect(latestQuery(onQuery).get("action")).toBe("content_publish");
    expect(latestQuery(onQuery).get("page")).toBe("1");
  });

  it("paginates: Berikutnya fetches page 2 and Sebelumnya goes back", async () => {
    const onQuery = vi.fn();
    const meta = { page: 1, page_size: 50, total: 55, total_pages: 2 };
    server.use(
      usersListHandler(USERS),
      auditListHandler(AUDIT_ROWS, meta, onQuery)
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Konten diterbitkan");
    await screen.findByText("Halaman 1 dari 2");

    const prev = screen.getByRole("button", { name: /Sebelumnya/ });
    const next = screen.getByRole("button", { name: /Berikutnya/ });
    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();

    await user.click(next);
    await waitFor(() => {
      expect(latestQuery(onQuery).get("page")).toBe("2");
    });
    expect(screen.getByText("Halaman 2 dari 2")).toBeInTheDocument();
    expect(prev).toBeEnabled();

    await user.click(prev);
    await waitFor(() => {
      expect(latestQuery(onQuery).get("page")).toBe("1");
    });
  });

  it("lets admins download the audit CSV via fetch blob + object URL click", async () => {
    const onExport = vi.fn();
    const createObjectUrl = vi.fn(() => "blob:mock-audit");
    const revokeObjectUrl = vi.fn();
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    URL.createObjectURL =
      createObjectUrl as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL =
      revokeObjectUrl as unknown as typeof URL.revokeObjectURL;
    server.use(
      usersListHandler(USERS),
      auditListHandler(AUDIT_ROWS, AUDIT_META),
      auditCsvHandler(onExport)
    );
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Konten diterbitkan");
    await user.click(screen.getByRole("button", { name: "Ekspor CSV" }));

    await waitFor(() => expect(onExport).toHaveBeenCalledTimes(1));
    const request = onExport.mock.calls[0][0] as Request;
    expect(new URL(request.url).pathname).toBe(
      "/api/admin/audit/export.csv"
    );
    expect(request.credentials).toBe("include");
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(
      (createObjectUrl.mock.calls[0] as unknown as [Blob])[0]
    ).toBeInstanceOf(Blob);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:mock-audit");
  });

  it("blocks non-admins: menu hidden and route guard shows admin-only notice", async () => {
    server.use(adminMeAs("content_manager"));
    renderPage();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    expect(
      screen.getByText("Halaman ini khusus untuk admin.")
    ).toBeInTheDocument();

    const hrefs = menuForRole("content_manager").map((item) => item.href);
    expect(hrefs).not.toContain("/admin/aktivitas");
    expect(hrefs).toContain("/admin/konten");
  });
});
