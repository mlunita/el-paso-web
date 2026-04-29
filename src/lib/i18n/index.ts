import en from "./en";
import es from "./es";
import type { Strings } from "./en";

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "elpaso_locale";
export const localeStorageKey = "elpaso_locale";
export const cookieConsentStorageKey = "elpaso_cookie_consent";
export const localeHeaderName = "x-elpaso-locale";
export const pathHeaderName = "x-elpaso-pathname";

export const dictionaries: Record<Locale, Strings> = {
  en,
  es,
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "es";
}

export function resolveLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function getDictionary(locale: string | null | undefined = defaultLocale) {
  return dictionaries[resolveLocale(locale)];
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === "/es") {
    return "/";
  }

  if (pathname.startsWith("/es/")) {
    return pathname.slice(3) || "/";
  }

  if (pathname === "/en") {
    return "/";
  }

  if (pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }

  return pathname || "/";
}

export function getPathLocale(pathname: string): Locale | null {
  if (pathname === "/es" || pathname.startsWith("/es/")) return "es";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  return null;
}

export function getLocalizedPath(pathname: string, locale: Locale) {
  const normalized = stripLocalePrefix(pathname || "/");
  if (locale === defaultLocale) {
    return normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function getAlternateLanguages(pathname: string) {
  const normalized = stripLocalePrefix(pathname || "/");
  return {
    en: getLocalizedPath(normalized, "en"),
    es: getLocalizedPath(normalized, "es"),
  };
}

export function formatDate(value: Date | string, locale: Locale, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(getDictionary(locale).locale.dateLocale, options).format(new Date(value));
}

export function formatDateTime(value: Date | string, locale: Locale) {
  return new Intl.DateTimeFormat(getDictionary(locale).locale.dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatStatus(status: string, t: Strings) {
  return t.statuses[status as keyof Strings["statuses"]] || status.replace(/_/g, " ");
}

export type { Strings };
