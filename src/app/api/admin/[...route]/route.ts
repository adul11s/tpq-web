import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const FORWARD_REQUEST_HEADERS = [
  "cookie",
  "content-type",
  "accept",
  "x-csrf-token",
  "origin",
] as const;

async function forward(
  request: NextRequest,
  segments: string[],
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
): Promise<Response> {
  if (!API_BASE) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const base = API_BASE.replace(/\/+$/, "");
  const target = `${base}/admin/${segments.join("/")}${request.nextUrl.search}`;

  const body = await request.arrayBuffer();

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (body.byteLength > 0) {
    headers.set("content-length", String(body.byteLength));
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: body.byteLength > 0 ? body : undefined,
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { error: "Tidak dapat terhubung ke server" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  for (const setCookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", setCookie);
  }

  const upstreamBody = await upstream.arrayBuffer();
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> },
): Promise<Response> {
  const { route } = await params;
  return forward(request, route ?? [], "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> },
): Promise<Response> {
  const { route } = await params;
  return forward(request, route ?? [], "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> },
): Promise<Response> {
  const { route } = await params;
  return forward(request, route ?? [], "DELETE");
}
