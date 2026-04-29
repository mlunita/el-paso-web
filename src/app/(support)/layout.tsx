import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Dot } from "lucide-react";
import { getSupportNavigationCategories } from "@/lib/support-data";
import { getTranslations } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export const dynamic = "force-dynamic";

export default async function SupportLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations();
  const categories = await getSupportNavigationCategories();

  return (
    <div className="relative min-h-screen bg-[var(--ep-bg-deep)] text-[var(--ep-text-primary)]">
      <div className="relative">
        <header className="border-b border-[var(--ep-border)] bg-[var(--ep-bg-surface)]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href="/support" className="block font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-[0.28em] text-[var(--ep-accent)]">
                  {t.support.brand}
                </Link>
                <p className="mt-1 text-sm text-[var(--ep-text-secondary)]">
                  {t.support.layoutDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--ep-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ep-text-primary)] transition-colors hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.support.mainSite}
                </Link>
              </div>
            </div>

            {categories.length > 0 && (
              <nav className="flex gap-2 overflow-x-auto pb-1" aria-label={t.support.sectionsAria}>
                <Link
                  href="/support"
                  className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-[var(--ep-accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--ep-bg-deep)]"
                >
                  {t.support.allPosts}
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/support/${category.slug}`}
                    className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[var(--ep-border)] bg-[var(--ep-bg-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ep-text-secondary)] transition-colors hover:border-[var(--ep-border-accent)] hover:text-[var(--ep-accent)]"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-[var(--ep-border)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 text-xs uppercase tracking-[0.18em] text-[var(--ep-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span>{t.support.footerLeft}</span>
              <span className="hidden sm:inline-flex items-center"><Dot className="h-4 w-4" /></span>
              <span>{t.support.footerRight}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </footer>
      </div>
    </div>
  );
}
