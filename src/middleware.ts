import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection — admin panel AND museum view require login.
 * Full session validation still happens client-side (Zustand + /me).
 */

const PUBLIC_PATHS = ["/", "/login", "/invite", "/activate"];
const AUTH_COOKIE = "medal_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets always pass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Explicit public paths (login, invite, activate)
  if (
    PUBLIC_PATHS.some(
      (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`))
    )
  ) {
    return NextResponse.next();
  }

  // Protected: admin + museum (entire site view)
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/museum");

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
