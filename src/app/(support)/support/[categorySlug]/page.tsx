import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { SupportEntryCard } from "@/components/support-entry-card";
import { getSupportCategoryBySlug } from "@/lib/support-data";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();
  const { categorySlug } = await params;
  const category = await getSupportCategoryBySlug(categorySlug);

  if (!category) return { title: t.seo.pages.support.sectionTitle };

  const description = category.description || t.seo.pages.support.categoryFallback(category.name);
  return createLocalizedMetadata({
    locale,
    path: `/support/${category.slug}`,
    title: category.name,
    description,
  });
}

export default async function SupportCategoryPage({ params }: CategoryPageProps) {
  const t = await getTranslations();
  const { categorySlug } = await params;
  const category = await getSupportCategoryBySlug(categorySlug);

  if (!category) notFound();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <Link
          href="/support"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--ep-border)] bg-[var(--ep-bg-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ep-text-primary)] transition-colors hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.support.backToArchive}
        </Link>

        <div className="max-w-3xl space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ep-text-muted)]">{t.support.sectionEyebrow}</div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--ep-text-primary)] sm:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="text-[15px] leading-7 text-[var(--ep-text-secondary)] sm:text-base">{category.description}</p>
          )}
        </div>
      </section>

      {category.entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--ep-border)] bg-[var(--ep-bg-surface)]/70 px-6 py-14 text-center text-[var(--ep-text-secondary)]">
          {t.support.emptySection}
        </div>
      ) : (
        <section className="space-y-4">
          {category.entries.map((entry) => (
            <SupportEntryCard key={entry.id} entry={entry} variant="feed" showCategory={false} />
          ))}
        </section>
      )}
    </div>
  );
}
