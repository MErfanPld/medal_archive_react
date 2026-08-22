import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight route protection.
 * Full session validation happens client-side (Zustand + /me).
 * Middleware only checks for presence of the auth cookie/token hint
 * to avoid flashing private pages. The real JWT lives in localStorage
 * via Zustand persist, so we also accept a lightweight cookie set on login.
 */

const PUBLIC_PATHS = ["/", "/login", "/invite", "/activate"];
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

  // Museum + Admin require login. Unauthenticated users never see museum UI.
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/museum");

  if (!isProtected) {
    return NextResponse.next();
  }

  // Cookie set by the client after successful login (see auth-store).
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
    /*
     * Match all request paths except static files and API routes
     * that Next.js serves itself.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
