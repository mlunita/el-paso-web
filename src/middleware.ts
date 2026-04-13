import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — protected by NextAuth JWT
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Validate existence and role
    if (!token || token.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
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
  matcher: ["/admin/:path*", "/mod/:path*"],
};
