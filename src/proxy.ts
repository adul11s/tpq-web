import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LANG_PATTERN = /^\/(en|id)(\/|$)/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/en" ||
    pathname === "/id" ||
    LANG_PATTERN.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/id${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|samples/|placeholders/|.*\\..*).*)",
  ],
};
