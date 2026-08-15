import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight route protection.
 * Full session validation happens client-side (Zustand + /me).
 */

const PUBLIC_PATHS = ["/", "/login", "/invite", "/activate"];
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

  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/museum");

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasAuthHint = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (!hasAuthHint) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
