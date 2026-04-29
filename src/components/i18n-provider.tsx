"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  dictionaries,
  getLocalizedPath,
  localeCookieName,
  localeStorageKey,
  resolveLocale,
  type Locale,
  type Strings,
} from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  t: Strings;
  changeLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLocale(locale: Locale) {
  window.localStorage.setItem(localeStorageKey, locale);
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const locale = resolveLocale(initialLocale);

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      t: dictionaries[locale],
      changeLocale: (nextLocale) => {
        const resolved = resolveLocale(nextLocale);
        persistLocale(resolved);

        const pathname = window.location.pathname || "/";
        const search = window.location.search || "";
        const hash = window.location.hash || "";
        const target = `${getLocalizedPath(pathname, resolved)}${search}${hash}`;

        if (target !== `${pathname}${search}${hash}`) {
          window.location.assign(target);
        }
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
