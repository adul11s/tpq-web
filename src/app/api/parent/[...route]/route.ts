import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function forward(
  request: NextRequest,
  segments: string[],
  method: "GET" | "POST",
): Promise<Response> {
  if (!API_BASE) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const path = segments.join("/");
  const base = API_BASE.replace(/\/+$/, "");
  const target = `${base}/parent/${path}${request.nextUrl.search}`;

  const bodyText = await request
    .text()
    .catch(() => "");

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  if (bodyText) {
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    headers.set("content-length", String(Buffer.byteLength(bodyText)));
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: bodyText || undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Tidak dapat terhubung ke server" },
      { status: 502 },
    );
  }

  const upstreamBody = await upstream.text().catch(() => "");
  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  for (const setCookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", setCookie);
  }

  return new Response(upstreamBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> },
): Promise<Response> {
  const { route } = await params;
  return forward(request, route ?? [], "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> },
): Promise<Response> {
  const { route } = await params;
  return forward(request, route ?? [], "POST");
}