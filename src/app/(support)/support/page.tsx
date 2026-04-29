import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SupportEntryCard } from "@/components/support-entry-card";
import { getSupportHomeData } from "@/lib/support-data";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();

  return createLocalizedMetadata({
    locale,
    path: "/support",
    title: t.seo.pages.support.title,
    description: t.seo.pages.support.description,
  });
}

export default async function SupportPage() {
  const t = await getTranslations();
  const { latestEntries, featuredEntries, categories } = await getSupportHomeData();

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="space-y-5">
          <div className="max-w-2xl space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ep-text-muted)]">
              {t.support.tagline}
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-[var(--ep-text-primary)] sm:text-4xl">
              {t.support.heading}
            </h1>
            <p className="text-[15px] leading-7 text-[var(--ep-text-secondary)] sm:text-base">
              {t.support.desc}
            </p>
          </div>

          {latestEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--ep-border)] bg-[var(--ep-bg-surface)]/70 px-6 py-14 text-center text-[var(--ep-text-secondary)]">
              {t.support.noEntries}
            </div>
          ) : (
            <div className="space-y-4">
              {latestEntries.map((entry) => (
                <SupportEntryCard key={entry.id} entry={entry} variant="feed" />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          {featuredEntries.length > 0 && (
            <section className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ep-text-muted)]">
                {t.support.featured}
              </div>
              <div className="space-y-3">
                {featuredEntries.map((entry) => (
                  <SupportEntryCard key={entry.id} entry={entry} variant="featured" />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-[var(--ep-border)] bg-[var(--ep-bg-surface)] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--ep-text-primary)]">{t.support.sections}</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--ep-text-secondary)]">{t.support.sectionsSub}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/support/${category.slug}`}
                  className="group flex min-h-12 items-start justify-between gap-4 rounded-xl border border-[var(--ep-border)] px-4 py-3 transition-colors hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)]"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--ep-text-primary)]">{category.name}</div>
                    <div className="mt-1 text-sm leading-6 text-[var(--ep-text-secondary)]">
                      {category.description || category.latestEntry?.title || t.support.fallbackCategoryDescription}
                    </div>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ep-text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
