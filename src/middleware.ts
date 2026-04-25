import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — check admin_session cookie presence for routing
  // Note: Full session validation (HMAC signature, expiry, DB token status)
  // happens in server components/actions via requireAdminSession()
  if (pathname.startsWith("/hq")) {
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession?.value) {
      const loginUrl = new URL("/hq-login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Mod routes — protected by mod_session cookie
  if (pathname.startsWith("/mod")) {
    const modSession = request.cookies.get("mod_session");
    if (!modSession?.value) {
      const loginUrl = new URL("/mod-login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Note: full session validation (DB check) happens in server components/actions
    // Middleware only checks cookie presence for fast redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hq/:path*", "/mod/:path*"],
};
