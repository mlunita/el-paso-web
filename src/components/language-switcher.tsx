"use client";

import { Globe2 } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, t, changeLocale } = useI18n();

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: t.language.english },
    { value: "es", label: t.language.spanish },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="language-switcher"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ep-text-muted)]"
      >
        <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
        {t.language.label}
      </label>
      <select
        id="language-switcher"
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        aria-label={t.footer.languageHelp}
        className="h-10 rounded-xl border border-[var(--ep-border)] bg-[var(--ep-bg-elevated)] px-3 text-sm font-semibold text-[var(--ep-text-primary)] outline-none transition-colors hover:border-[var(--ep-border-accent)] focus-visible:border-[var(--ep-border-accent)] focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
