"use client";

import { useEffect, useState } from "react";
import { Cookie, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { cookieConsentStorageKey } from "@/lib/i18n";

export function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(cookieConsentStorageKey) !== "accepted");
  }, []);

  const accept = () => {
    window.localStorage.setItem(cookieConsentStorageKey, "accepted");
    document.cookie = `${cookieConsentStorageKey}=accepted; path=/; max-age=31536000; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t.cookie.title}
      className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-[var(--ep-border)] bg-[var(--ep-bg-surface)]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ep-border-accent)] bg-[var(--ep-accent-muted)] text-[var(--ep-accent)]">
            <Cookie className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-[0.16em] text-[var(--ep-text-primary)]">
              {t.cookie.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--ep-text-secondary)]">
              {t.cookie.message}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={accept}
          aria-label={t.cookie.dismissLabel}
          className="min-h-11 shrink-0 rounded-xl bg-[var(--ep-accent)] px-5 text-sm font-extrabold uppercase tracking-wider text-[var(--ep-bg-deep)] hover:bg-[var(--ep-accent-hover)]"
        >
          <Check className="mr-2 h-4 w-4" aria-hidden="true" />
          {t.cookie.accept}
        </Button>
      </div>
    </div>
  );
}
