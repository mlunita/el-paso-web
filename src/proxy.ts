import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const localeCookieName = "elpaso_locale";
const localeHeaderName = "x-elpaso-locale";
const pathHeaderName = "x-elpaso-pathname";

type Locale = "en" | "es";

function getPathLocale(pathname: string): Locale | null {
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return null;
}

function stripLocale(pathname: string) {
  if (pathname === "/es" || pathname === "/en") return "/";
  if (pathname.startsWith("/es/") || pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname || "/";
}

function getLocalizedPath(pathname: string, locale: Locale) {
  const internalPath = stripLocale(pathname);
  if (locale === "en") return internalPath;
  return internalPath === "/" ? "/es" : `/es${internalPath}`;
}

function getCookieLocale(request: NextRequest): Locale {
  return request.cookies.get(localeCookieName)?.value === "es" ? "es" : "en";
}

function withLocale(response: NextResponse, locale: Locale) {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

function responseInit(request: NextRequest, locale: Locale) {
  request.headers.set(localeHeaderName, locale);
  request.headers.set(pathHeaderName, request.nextUrl.pathname);
  return { request: { headers: request.headers } };
}

function isProtectedAdminPath(pathname: string) {
  return pathname === "/hq" || pathname.startsWith("/hq/");
}

function isProtectedModPath(pathname: string) {
  return pathname === "/mod" || pathname.startsWith("/mod/");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathLocale = getPathLocale(pathname);
  const cookieLocale = getCookieLocale(request);
  const locale = pathLocale || cookieLocale;
  const internalPath = stripLocale(pathname);

  if (pathLocale === "en" && request.method === "GET") {
    const url = request.nextUrl.clone();
    url.pathname = internalPath;
    return withLocale(NextResponse.redirect(url), "en");
  }

  if (!pathLocale && cookieLocale === "es" && request.method === "GET") {
    const url = request.nextUrl.clone();
    url.pathname = getLocalizedPath(pathname, "es");
    return NextResponse.redirect(url);
  }

  if (isProtectedAdminPath(internalPath)) {
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession?.value) {
      const loginUrl = new URL(getLocalizedPath("/hq-login", locale), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isProtectedModPath(internalPath)) {
    const modSession = request.cookies.get("mod_session");
    if (!modSession?.value) {
      const loginUrl = new URL(getLocalizedPath("/mod-login", locale), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathLocale) {
    const url = request.nextUrl.clone();
    url.pathname = internalPath;
    return withLocale(NextResponse.rewrite(url, responseInit(request, locale)), locale);
  }

  return withLocale(NextResponse.next(responseInit(request, locale)), locale);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
