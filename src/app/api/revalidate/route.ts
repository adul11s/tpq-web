import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

function secretMatches(incoming: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET ?? "";
  if (!expected || !incoming) {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(incoming);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

interface RevalidateBody {
  entity?: string;
  id?: number | string;
  slug?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!secretMatches(request.headers.get("x-revalidate-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    body = {};
  }

  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({
    ok: true,
    revalidated: {
      entity: body.entity ?? null,
      id: body.id ?? null,
      slug: body.slug ?? null,
    },
  });
}
