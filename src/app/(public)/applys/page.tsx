import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ApplyForm } from "./client-form";
import { SectionHeading } from "@/components/section-heading";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();

  return createLocalizedMetadata({
    locale,
    path: "/applys",
    title: t.seo.pages.apply.title,
    description: t.seo.pages.apply.description,
    robots: { index: false, follow: true },
  });
}

export default async function ApplyPage() {
  const t = await getTranslations();
  const settings = await prisma.siteSettings.findFirst().catch(() => null);
  const applicationsOpen = settings ? settings.appsOpen : true;

  return (
    <div className="ep-section py-8 sm:py-12">
      <div className="ep-section-inner">
        <SectionHeading title={t.apply.heading} subtitle={t.apply.subtitle} icon={FileText} />

        <div className="max-w-3xl w-full mx-auto ep-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="ep-card-elevated rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--ep-accent)] via-[var(--ep-accent-hover)] to-[var(--ep-secondary)]" />
            <div className="absolute -top-[30%] -right-[15%] w-[50%] h-[50%] bg-[var(--ep-accent)]/[0.03] blur-[80px] rounded-full pointer-events-none" />

            <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-extrabold mb-4 uppercase tracking-wider text-[var(--ep-text-primary)] mt-2 flex items-center gap-3">
              <div className="h-[2px] w-6 bg-[var(--ep-accent)] rounded-full" />
              {t.apply.cardTitle}
            </h2>
            <p className="mb-6 sm:mb-8 text-[var(--ep-text-secondary)] font-medium line-clamp-2">
              {applicationsOpen ? t.apply.cardDesc.open : t.apply.cardDesc.closed}
            </p>

            {applicationsOpen ? (
              <ApplyForm />
            ) : (
              <div className="bg-[var(--ep-danger)]/5 p-8 sm:p-12 rounded-xl text-center border border-[var(--ep-danger)]/15">
                <div className="font-[family-name:var(--font-heading)] text-3xl font-extrabold uppercase tracking-widest text-[var(--ep-danger)]/70">
                  {t.apply.closed}
                </div>
                <p className="text-[var(--ep-danger)]/50 mt-4 font-medium">{t.apply.closedSub}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
