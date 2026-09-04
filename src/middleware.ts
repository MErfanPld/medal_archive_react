import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection — only the admin panel requires login.
 * Public museum site (/museum, /, etc.) is open without auth.
 */

const PUBLIC_PATHS = ["/", "/login", "/invite", "/activate", "/museum"];
const AUTH_COOKIE = "medal_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    ) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Only admin panel requires login
  const isProtected = pathname.startsWith("/admin");

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasAuthHint = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (!hasAuthHint) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|media/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
