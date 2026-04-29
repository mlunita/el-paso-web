import type { Metadata } from "next";
import { Activity, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CheckStatusForm } from "./client-form";
import { StatusBadge } from "@/components/status-badge";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();

  return createLocalizedMetadata({
    locale,
    path: "/status",
    title: t.seo.pages.status.title,
    description: t.seo.pages.status.description,
    robots: { index: false, follow: true },
  });
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ refCode?: string }>;
}) {
  const t = await getTranslations();
  const { refCode } = await searchParams;
  const application = refCode
    ? await prisma.application.findUnique({ where: { refCode: refCode.toUpperCase() } }).catch(() => null)
    : null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-emerald-500/5",
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          glow: "shadow-emerald-500/10",
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      case "REJECTED":
        return {
          bg: "bg-red-500/5",
          text: "text-red-400",
          border: "border-red-500/20",
          glow: "shadow-red-500/10",
          icon: <XCircle className="w-5 h-5" />,
        };
      case "REVIEWED":
        return {
          bg: "bg-amber-500/5",
          text: "text-amber-400",
          border: "border-amber-500/20",
          glow: "shadow-amber-500/10",
          icon: <Eye className="w-5 h-5" />,
        };
      default:
        return {
          bg: "bg-zinc-800/50",
          text: "text-zinc-300",
          border: "border-[var(--ep-border)]",
          glow: "shadow-black/10",
          icon: <Clock className="w-5 h-5" />,
        };
    }
  };

  return (
    <div className="ep-section py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 ep-fade-up">
          <div className="relative inline-flex items-center justify-center p-4 rounded-full mb-6">
            <div className="absolute inset-0 bg-[var(--ep-accent-muted)] rounded-full ep-glow-pulse" />
            <div className="relative bg-[var(--ep-accent-muted)] p-4 rounded-full border border-[var(--ep-border-accent)]">
              <Activity className="w-8 sm:w-10 h-8 sm:h-10 text-[var(--ep-accent)]" />
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--ep-text-primary)] mb-4">
            {t.applicationStatus.heading}
          </h1>
          <p className="text-[var(--ep-text-secondary)] text-base sm:text-lg">
            {t.applicationStatus.subtitle}
          </p>
        </div>

        <div className="w-full ep-fade-up" style={{ animationDelay: "150ms" }}>
          <CheckStatusForm defaultValue={refCode} />

          {refCode && (
            <div className="mt-8 sm:mt-12 w-full animate-in slide-in-from-bottom-4 duration-500">
              {application ? (() => {
                const config = getStatusConfig(application.status);
                return (
                  <div className="ep-card-elevated rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ep-accent)]/[0.03] rounded-full blur-[80px] pointer-events-none" />

                    <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-widest text-[var(--ep-text-muted)] mb-6 sm:mb-8 border-b border-[var(--ep-border)] pb-4 flex items-center gap-3">
                      <div className="h-[2px] w-6 bg-[var(--ep-accent)] rounded-full" />
                      {t.applicationStatus.report}
                    </h2>

                    <div className="flex flex-col md:flex-row gap-6 sm:gap-8 justify-between items-center bg-[var(--ep-bg-deep)] p-5 sm:p-6 rounded-xl border border-[var(--ep-border)]">
                      <div className="flex flex-col text-center md:text-left">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--ep-text-muted)] mb-1">
                          {t.applicationStatus.applicant}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-[var(--ep-text-primary)]">{application.discord}</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-extrabold tracking-widest text-sm uppercase shadow-lg ${config.bg} ${config.text} ${config.border} border ${config.glow}`}>
                          {config.icon}
                          <StatusBadge status={application.status} />
                        </div>
                      </div>
                    </div>

                    {application.notes && (
                      <div className="mt-6 bg-[var(--ep-accent-muted)] border border-[var(--ep-border-accent)] p-5 sm:p-6 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-[2px] w-4 bg-[var(--ep-accent)]/50 rounded-full" />
                          <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--ep-accent)]">
                            {t.applicationStatus.adminResponse}
                          </span>
                        </div>
                        <p className="text-[var(--ep-text-secondary)] italic leading-relaxed">{application.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="bg-[var(--ep-danger)]/5 border border-[var(--ep-danger)]/15 rounded-xl p-6 sm:p-8 text-center">
                  <XCircle className="w-10 h-10 text-[var(--ep-danger)]/60 mx-auto mb-3" />
                  <span className="text-[var(--ep-danger)]/80 font-bold text-lg">{t.applicationStatus.notFound}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
