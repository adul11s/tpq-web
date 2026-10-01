import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type {
  AdminAuditRow,
  AdminInquiry,
  AdminMe,
  AdminMediaAsset,
  AdminUser,
  InquiryStatus,
  Role,
} from "../src/lib/types/admin";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const ME: AdminMe = {
  id: 1,
  email: "admin@tpq-qurani.example.id",
  full_name: "Ustadz Admin",
  role: "admin",
  has_2fa: true,
};

export const adminMeOk = http.get(`*/api/admin/me`, () =>
  HttpResponse.json(ME)
);

export const adminMeUnauthorized = http.get(`*/api/admin/me`, () =>
  HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
);

export const adminMeAs = (role: Role) =>
  http.get(`*/api/admin/me`, () => HttpResponse.json({ ...ME, role }));

export const CLASS_ROWS: Record<string, unknown>[] = [
  {
    id: 1,
    code: "TK",
    name: "TK Qur'ani Bintang",
    name_en: null,
    age_min: 5,
    age_max: 6,
    description: null,
    description_en: null,
    hours: "08.00-10.00 WIB",
    fees: null,
    capacity: "24",
    status: "draft",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
  {
    id: 2,
    code: "TPA",
    name: "TPA Qur'ani Bintang",
    name_en: null,
    age_min: 7,
    age_max: 12,
    description: null,
    description_en: null,
    hours: "16.00-18.00 WIB",
    fees: null,
    capacity: "30",
    status: "published",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-01T08:00:00Z",
  },
];

export const categoriesHandler = (rows: Record<string, unknown>[]) =>
  http.get(`${API_BASE}/categories`, () => HttpResponse.json(rows));

export const contentListHandler = (
  entity: string,
  rows: Record<string, unknown>[],
  onQuery?: (params: URLSearchParams) => void
) =>
  http.get(`*/api/admin/${entity}`, ({ request }) => {
    onQuery?.(new URL(request.url).searchParams);
    return HttpResponse.json({ [entity]: rows });
  });

export const contentListError = (entity: string, status = 500) =>
  http.get(`*/api/admin/${entity}`, () =>
    HttpResponse.json({ error: "Internal server error" }, { status })
  );

export const contentPreviewHandler = (
  entity: string,
  row: Record<string, unknown>
) =>
  http.get(`*/api/admin/${entity}/${String(row.id)}/preview`, () =>
    HttpResponse.json(row)
  );

export const contentCreateHandler = (
  entity: string,
  onRequest?: (request: Request, body: unknown) => void
) =>
  http.post(`*/api/admin/${entity}`, async ({ request }) => {
    const body = await request.json();
    onRequest?.(request, body);
    return HttpResponse.json({ id: 99 }, { status: 201 });
  });

export const contentCreateError = (
  entity: string,
  status: number,
  body: Record<string, unknown>
) =>
  http.post(`*/api/admin/${entity}`, () =>
    HttpResponse.json(body, { status })
  );

export const contentUpdateHandler = (
  entity: string,
  onRequest?: (request: Request, body: unknown) => void
) =>
  http.patch(`*/api/admin/${entity}/:id`, async ({ request }) => {
    const body = await request.json();
    onRequest?.(request, body);
    return HttpResponse.json({});
  });

export const contentDeleteHandler = (
  entity: string,
  onRequest?: (request: Request, params: Record<string, string>) => void
) =>
  http.delete(`*/api/admin/${entity}/:id`, ({ request, params }) => {
    onRequest?.(request, params as Record<string, string>);
    return HttpResponse.json(null, { status: 204 });
  });

export const contentPublishHandler = (
  entity: string,
  onRequest?: (request: Request) => void
) =>
  http.post(`*/api/admin/${entity}/:id/publish`, ({ request }) => {
    onRequest?.(request);
    return HttpResponse.json({});
  });

export const contentArchiveHandler = (
  entity: string,
  onRequest?: (request: Request) => void
) =>
  http.post(`*/api/admin/${entity}/:id/archive`, ({ request }) => {
    onRequest?.(request);
    return HttpResponse.json({});
  });

export const adminLoginChallenge = (challenge: "totp" | "enroll") =>
  http.post(`*/api/admin/auth/login`, () =>
    HttpResponse.json({ challenge })
  );

export const adminLoginUnauthorized = http.post(`*/api/admin/auth/login`, () =>
  HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
);

export const adminLoginRateLimited = http.post(`*/api/admin/auth/login`, () =>
  HttpResponse.json(
    { error: "Terlalu banyak percobaan login, coba lagi nanti" },
    { status: 429 }
  )
);

export const adminLoginDelayed = http.post(`*/api/admin/auth/login`, async () => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return HttpResponse.json({ challenge: "totp" });
});

export const adminVerifyOk = http.post(`*/api/admin/auth/verify-2fa`, () =>
  HttpResponse.json({ ok: true })
);

export const adminVerifyUnauthorized = http.post(
  `*/api/admin/auth/verify-2fa`,
  () => HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
);

export const adminVerifyRateLimited = http.post(
  `*/api/admin/auth/verify-2fa`,
  () =>
    HttpResponse.json(
      { error: "Terlalu banyak percobaan verifikasi, coba lagi nanti" },
      { status: 429 }
    )
);

export const ENROLL_SECRET = "JBSWY3DPEHPK3PXP";
export const ENROLL_OTPAUTH_URI =
  "otpauth://totp/TPQ%20Qurani:admin%40tpq-qurani.example.id?secret=JBSWY3DPEHPK3PXP&issuer=TPQ%20Qurani";
export const ENROLL_BACKUP_CODES = [
  "A1B2-C3D4",
  "E5F6-G7H8",
  "I9J0-K1L2",
  "M3N4-O5P6",
  "Q7R8-S9T0",
  "U1V2-W3X4",
  "Y5Z6-A7B8",
  "C9D0-E1F2",
];

export const adminEnrollOk = http.post(`*/api/admin/auth/enroll`, () =>
  HttpResponse.json({
    secret: ENROLL_SECRET,
    otpauth_uri: ENROLL_OTPAUTH_URI,
    backup_codes: ENROLL_BACKUP_CODES,
  })
);

export const adminEnrollConfirmCapture = (onBody: (body: unknown) => void) =>
  http.post(`*/api/admin/auth/enroll-confirm`, async ({ request }) => {
    onBody(await request.json());
    return HttpResponse.json({ ok: true });
  });

export const adminEnrollConfirmUnauthorized = http.post(
  `*/api/admin/auth/enroll-confirm`,
  () => HttpResponse.json({ error: "Invalid credentials" }, { status: 401 })
);

export const MEDIA_ROWS: AdminMediaAsset[] = [
  {
    id: 1,
    original_name: "laporan-bulanan.pdf",
    storage_key: "media/2026/08/laporan.pdf",
    mime_type: "application/pdf",
    file_size: 2_400_000,
    kind: "pdf",
    created_at: "2026-08-10T08:00:00Z",
  },
  {
    id: 2,
    original_name: "foto-kegiatan.jpg",
    storage_key: "media/2026/08/foto.jpg",
    mime_type: "image/jpeg",
    file_size: 1_100_000,
    kind: "image",
    created_at: "2026-08-11T08:00:00Z",
  },
];

export const mediaListHandler = (onRequest?: () => void) =>
  http.get(`*/api/admin/media`, () => {
    onRequest?.();
    return HttpResponse.json({ media: MEDIA_ROWS });
  });

export const mediaUploadHandler = (onRequest?: (request: Request) => void) =>
  http.post(`*/api/admin/media`, ({ request }) => {
    onRequest?.(request);
    return HttpResponse.json(
      {
        id: 99,
        storage_key: "media/2026/08/new.pdf",
        mime_type: "application/pdf",
        file_size: 512_000,
        kind: "pdf",
      },
      { status: 201 }
    );
  });

export const mediaUploadError = (status: number, body: Record<string, unknown>) =>
  http.post(`*/api/admin/media`, () => HttpResponse.json(body, { status }));

export const classesPublicHandler = (rows: Record<string, unknown>[] = CLASS_ROWS) =>
  http.get(`${API_BASE}/classes`, () => HttpResponse.json(rows));

export const inquiriesListHandler = (
  rows: AdminInquiry[],
  onQuery?: (params: URLSearchParams) => void
) =>
  http.get(`*/api/admin/inquiries`, ({ request }) => {
    onQuery?.(new URL(request.url).searchParams);
    return HttpResponse.json({ inquiries: rows });
  });

export const inquiryUpdateHandler = (
  rows: AdminInquiry[],
  onRequest?: (request: Request, body: unknown) => void
) =>
  http.patch(`*/api/admin/inquiries/:id`, async ({ request, params }) => {
    const body = (await request.json()) as {
      status?: InquiryStatus;
      admin_note?: string;
    };
    onRequest?.(request, body);
    const row = rows.find((r) => r.id === Number(params.id));
    if (!row) {
      return HttpResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    return HttpResponse.json({
      inquiry: {
        ...row,
        status: body.status ?? row.status,
        admin_note: body.admin_note ?? row.admin_note,
      },
    });
  });

export const inquiriesCsvHandler = (onRequest?: (request: Request) => void) =>
  http.get(`*/api/admin/inquiries/export.csv`, ({ request }) => {
    onRequest?.(request);
    return HttpResponse.text(
      'id,parent_name,phone\n1,"Ibu Siti Rahma",081234567801\n',
      { headers: { "Content-Type": "text/csv; charset=utf-8" } }
    );
  });

export const usersListHandler = (rows: AdminUser[], onRequest?: () => void) =>
  http.get(`*/api/admin/users`, () => {
    onRequest?.();
    return HttpResponse.json({ users: rows });
  });

export const userReset2faHandler = (onRequest?: (request: Request) => void) =>
  http.post(`*/api/admin/users/:id/reset-2fa`, ({ request }) => {
    onRequest?.(request);
    return HttpResponse.json({ ok: true });
  });

export const userDeactivateHandler = (
  rows: AdminUser[],
  onRequest?: (request: Request) => void
) =>
  http.post(`*/api/admin/users/:id/deactivate`, ({ request, params }) => {
    onRequest?.(request);
    const row = rows.find((r) => r.id === Number(params.id));
    if (!row) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }
    row.is_active = false;
    return HttpResponse.json({ ok: true });
  });

export const userActivateHandler = (
  rows: AdminUser[],
  onRequest?: (request: Request) => void
) =>
  http.post(`*/api/admin/users/:id/activate`, ({ request, params }) => {
    onRequest?.(request);
    const row = rows.find((r) => r.id === Number(params.id));
    if (!row) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }
    row.is_active = true;
    return HttpResponse.json({ ok: true });
  });

export interface AuditMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export const auditListHandler = (
  rows: AdminAuditRow[],
  meta: AuditMeta,
  onQuery?: (params: URLSearchParams) => void
) =>
  http.get(`*/api/admin/audit`, ({ request }) => {
    onQuery?.(new URL(request.url).searchParams);
    return HttpResponse.json({ data: rows, meta });
  });

export const auditCsvHandler = (onRequest?: (request: Request) => void) =>
  http.get(`*/api/admin/audit/export.csv`, ({ request }) => {
    onRequest?.(request);
    return HttpResponse.text(
      'id,user_id,action,entity_type,entity_id,ip,user_agent,created_at\n' +
        '10,2,content_publish,prayer_guide,7,"203.0.113.10","Mozilla/5.0",2026-08-14T09:30:00.000Z\n',
      { headers: { "Content-Type": "text/csv; charset=utf-8" } }
    );
  });

export const server = setupServer(adminMeOk);
