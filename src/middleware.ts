import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight route protection.
 * Full session validation happens client-side (Zustand + /me).
 * Middleware only checks for presence of the auth cookie/token hint
 * to avoid flashing private pages. The real JWT lives in localStorage
 * via Zustand persist, so we also accept a lightweight cookie set on login.
 */

const PUBLIC_PATHS = ["/", "/login", "/invite", "/activate", "/museum"];
const AUTH_COOKIE = "medal_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
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

  // Museum is public. Admin remains protected.
  const isProtected = pathname.startsWith("/admin");

  if (!isProtected) {
    return NextResponse.next();
  }

  // Prefer cookie set by the client after successful login.
  // Fallback: let the client-side AuthGuard handle redirect (no hard block).
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
