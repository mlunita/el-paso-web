import { headers } from "next/headers";
import {
  defaultLocale,
  getDictionary,
  localeHeaderName,
  pathHeaderName,
  resolveLocale,
  stripLocalePrefix,
  type Locale,
} from "./index";

export async function getRequestLocale(): Promise<Locale> {
  const headerList = await headers();
  return resolveLocale(headerList.get(localeHeaderName));
}

export async function getRequestPathname() {
  const headerList = await headers();
  return stripLocalePrefix(headerList.get(pathHeaderName) || "/");
}

export async function getTranslations() {
  return getDictionary(await getRequestLocale());
}

export async function getLocaleContext() {
  const locale = await getRequestLocale();
  return {
    locale,
    t: getDictionary(locale),
  };
}

export function getStaticTranslations(locale: Locale = defaultLocale) {
  return getDictionary(locale);
}
