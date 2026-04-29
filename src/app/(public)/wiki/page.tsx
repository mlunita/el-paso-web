import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { WikiSections } from "./wiki-sections";
import { SectionHeading } from "@/components/section-heading";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();

  return createLocalizedMetadata({
    locale,
    path: "/wiki",
    title: t.seo.pages.wiki.title,
    description: t.seo.pages.wiki.description,
    twitterCard: "summary",
  });
}

export default async function WikiPage() {
  const t = await getTranslations();
  const items = await prisma.wikiItem.findMany({
    orderBy: [{ section: "asc" }, { order: "asc" }],
  }).catch(() => []);

  return (
    <div className="ep-section py-8 sm:py-12">
      <div className="ep-section-inner">
        <SectionHeading title={t.wiki.heading} subtitle={t.wiki.subtitle} icon={BookOpen} />

        <WikiSections items={items} />

        {items.length === 0 && (
          <div className="ep-card rounded-2xl border-dashed min-h-[300px] flex flex-col items-center justify-center text-[var(--ep-text-muted)] gap-5 ep-fade-up">
            <div className="relative">
              <BookOpen className="w-14 h-14 text-[var(--ep-text-muted)] ep-float" />
              <div className="absolute inset-0 bg-[var(--ep-accent)]/10 blur-2xl rounded-full" />
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-widest">{t.wiki.comingSoon}</span>
            <p className="text-sm">{t.wiki.comingSoonSub}</p>
          </div>
        )}
      </div>
    </div>
  );
}
