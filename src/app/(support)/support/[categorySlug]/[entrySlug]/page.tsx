import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";
import { SupportEntryCard } from "@/components/support-entry-card";
import { formatSupportDate, getSupportByline, getSupportPublishedDate } from "@/lib/support";
import { getRelatedSupportEntries, getSupportEntryBySlugs } from "@/lib/support-data";
import { getLocaleContext, getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type SupportEntryPageProps = {
  params: Promise<{ categorySlug: string; entrySlug: string }>;
};

export async function generateMetadata({ params }: SupportEntryPageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();
  const { categorySlug, entrySlug } = await params;
  const entry = await getSupportEntryBySlugs(categorySlug, entrySlug);

  if (!entry) return { title: t.seo.pages.support.entryTitle };

  const description = entry.content.replace(/\s+/g, " ").trim().slice(0, 160);
  return createLocalizedMetadata({
    locale,
    path: `/support/${entry.category.slug}/${entry.slug}`,
    title: entry.title,
    description,
    type: "article",
    publishedTime: entry.publishedAt?.toISOString(),
    authors: entry.authorName ? [entry.authorName] : undefined,
  });
}

function renderSupportContent(content: string) {
  return content.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) return <div key={`space-${index}`} className="h-4" aria-hidden="true" />;

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-10 text-2xl font-semibold tracking-tight text-[var(--ep-text-primary)]">
          {trimmed.replace("## ", "")}
        </h2>
      );
    }

    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={index} className="mt-12 text-3xl font-semibold tracking-tight text-[var(--ep-text-primary)]">
          {trimmed.replace("# ", "")}
        </h1>
      );
    }

    return (
      <p key={index} className="text-[15px] leading-8 text-[var(--ep-text-secondary)] sm:text-[17px]">
        {trimmed}
      </p>
    );
  });
}

export default async function SupportEntryPage({ params }: SupportEntryPageProps) {
  const { locale, t } = await getLocaleContext();
  const { categorySlug, entrySlug } = await params;
  const entry = await getSupportEntryBySlugs(categorySlug, entrySlug);

  if (!entry) notFound();

  const relatedEntries = await getRelatedSupportEntries(entry.categoryId, entry.id);

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="space-y-5">
        <Link
          href={`/support/${entry.category.slug}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--ep-border)] bg-[var(--ep-bg-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ep-text-primary)] transition-colors hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.support.backToCategory(entry.category.name)}
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ep-text-muted)]">
          <Link href="/support" className="transition-colors hover:text-[var(--ep-text-primary)]">{t.common.support}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/support/${entry.category.slug}`} className="transition-colors hover:text-[var(--ep-text-primary)]">
            {entry.category.name}
          </Link>
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ep-text-muted)]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--ep-accent)]" />
              {formatSupportDate(getSupportPublishedDate(entry), locale)}
            </span>
            <span>{getSupportByline(entry, t.support.defaultByline)}</span>
            <span>{entry.category.name}</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[var(--ep-text-primary)] sm:text-4xl md:text-5xl">
            {entry.title}
          </h1>
        </div>
      </section>

      <article className="rounded-2xl border border-[var(--ep-border)] bg-[var(--ep-bg-surface)] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-5">
          {renderSupportContent(entry.content)}
        </div>
      </article>

      {relatedEntries.length > 0 && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--ep-text-primary)]">{t.support.moreInCategory(entry.category.name)}</h2>
            <p className="text-sm leading-6 text-[var(--ep-text-secondary)]">{t.support.nearbyEntries}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedEntries.map((relatedEntry) => (
              <SupportEntryCard key={relatedEntry.id} entry={relatedEntry} variant="compact" showCategory={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
