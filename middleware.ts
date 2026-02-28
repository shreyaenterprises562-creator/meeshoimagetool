import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ✅ SAFE MIDDLEWARE (NO AUTO LOGIN REDIRECT)
 *
 * - Homepage / optimize page open freely
 * - Login only required when user does premium action
 * - Prevents /login 404 redirect loop
 */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Always allow public pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // ✅ Disable forced redirect completely
  // No auto redirect to /login
  return NextResponse.next();
}

/**
 * Middleware runs only on these routes
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
