import type { Metadata } from "next";
import { Activity, CheckCircle2, XCircle, Clock, Eye, ClipboardList, Hourglass } from "lucide-react";
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
    // Kept for backward compatibility if needed elsewhere
    return {};
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
                const status = application.status;
                const isReviewed = status === "REVIEWED" || status === "APPROVED" || status === "REJECTED";
                const isFinalized = status === "APPROVED" || status === "REJECTED";

                return (
                  <div className="ep-card-glass rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden border-[var(--ep-border)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ep-accent)]/[0.03] rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 border-b border-[var(--ep-border)] pb-6 gap-4">
                      <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-widest text-[var(--ep-text-muted)] flex items-center gap-3">
                        <div className="h-[2px] w-6 bg-[var(--ep-accent)] rounded-full" />
                        {t.applicationStatus.report}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--ep-text-muted)]">
                          {t.applicationStatus.applicant}:
                        </span>
                        <span className="text-lg font-bold text-[var(--ep-text-primary)] px-3 py-1 bg-[var(--ep-bg-hover)] rounded-md border border-[var(--ep-border)]">{application.discord}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-10 sm:gap-14 py-4 px-2 sm:px-6 mt-4">
                      {/* Step 1 */}
                      <div className="flex items-start gap-3 sm:gap-5 relative group animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both' }}>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-gradient-to-br from-[#c4c4c4] to-[#808080] border-2 border-white/10 relative transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-white relative z-10 drop-shadow-md transition-transform duration-500 group-hover:rotate-6" strokeWidth={3} />
                        </div>
                        
                        <div className="h-16 sm:h-20 flex flex-col justify-center shrink-0">
                           <div className="w-8 sm:w-14 h-[2px] bg-gradient-to-r from-white/90 to-white/40 group-hover:from-white group-hover:to-white/80 transition-all duration-500"></div>
                        </div>

                        <div className="flex flex-col pt-3 sm:pt-4 transition-transform duration-500 group-hover:translate-x-2">
                          <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-extrabold text-white leading-tight mb-1 drop-shadow-md">
                            Your application was sent
                          </h3>
                          <p className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
                            Now you must wait at least over a week for a response
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className={`flex items-start gap-3 sm:gap-5 relative group animate-in fade-in slide-in-from-bottom-8 duration-700 ${isReviewed ? 'opacity-100' : 'opacity-40 grayscale'} hover:grayscale-0 transition-all`} style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 relative border-2 ${isFinalized ? 'bg-gradient-to-br from-[#c4c4c4] to-[#808080] border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]' : isReviewed ? 'bg-gradient-to-br from-[#1c3d20] to-[#122614] border-emerald-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'bg-gradient-to-br from-[#c4c4c4] to-[#808080] border-white/10'}`}>
                          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative flex items-center justify-center">
                            <ClipboardList className={`w-8 h-8 sm:w-10 sm:h-10 ${isFinalized ? 'text-white' : isReviewed ? 'text-emerald-400' : 'text-white'} drop-shadow-md transition-transform duration-500 group-hover:-rotate-3`} strokeWidth={2.5} />
                            <div className={`absolute -bottom-3 -right-3 sm:-bottom-2 sm:-right-2 rounded-full p-1.5 backdrop-blur-md shadow-lg border ${isFinalized ? 'bg-[#808080] border-white/20' : isReviewed ? 'bg-[#122614] border-amber-500/50' : 'bg-[#808080] border-white/20'}`}>
                               <Hourglass className={`w-4 h-4 sm:w-5 sm:h-5 ${isFinalized ? 'text-white/80' : isReviewed ? 'text-amber-400 animate-pulse' : 'text-white/80'}`} strokeWidth={3} />
                            </div>
                          </div>
                        </div>
                        
                        <div className="h-16 sm:h-20 flex flex-col justify-center shrink-0">
                           <div className={`w-8 sm:w-14 h-[2px] transition-all duration-500 ${isFinalized ? 'bg-gradient-to-r from-white/90 to-white/40 group-hover:from-white group-hover:to-white/80' : isReviewed ? 'bg-gradient-to-r from-emerald-500/90 to-emerald-500/40 group-hover:from-emerald-400 group-hover:to-emerald-400/80' : 'bg-white/40'}`}></div>
                        </div>

                        <div className="flex flex-col pt-3 sm:pt-4 transition-transform duration-500 group-hover:translate-x-2">
                          <h3 className={`font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-extrabold leading-tight mb-1 drop-shadow-md ${isFinalized ? 'text-white' : isReviewed ? 'text-emerald-400' : 'text-white'}`}>
                            Your application was reviewed by a high rank
                          </h3>
                          <p className={`${isFinalized ? 'text-white/80' : isReviewed ? 'text-emerald-400/80' : 'text-white/80'} text-xs sm:text-sm font-medium tracking-wide`}>
                            Now you must wait for a response, check back later and be patient
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className={`flex items-start gap-3 sm:gap-5 relative group animate-in fade-in slide-in-from-bottom-8 duration-700 ${isFinalized ? 'opacity-100' : 'opacity-40 grayscale'} hover:grayscale-0 transition-all`} style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 relative border-2 ${status === 'APPROVED' ? 'bg-gradient-to-br from-[#00e676] to-[#00b248] border-[#00e676]/50 shadow-[0_0_40px_rgba(0,230,118,0.4)] group-hover:shadow-[0_0_50px_rgba(0,230,118,0.6)]' : status === 'REJECTED' ? 'bg-gradient-to-br from-[#ff1744] to-[#d50000] border-[#ff1744]/50 shadow-[0_0_40px_rgba(255,23,68,0.4)] group-hover:shadow-[0_0_50px_rgba(255,23,68,0.6)]' : 'bg-gradient-to-br from-[#c4c4c4] to-[#808080] border-white/10'}`}>
                          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          {status === 'REJECTED' ? (
                            <XCircle className="w-9 h-9 sm:w-11 sm:h-11 text-white drop-shadow-md transition-transform duration-500 group-hover:rotate-12" strokeWidth={3.5} />
                          ) : (
                            <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-white drop-shadow-md transition-transform duration-500 group-hover:rotate-12" strokeWidth={3.5} />
                          )}
                        </div>
                        
                        <div className="h-16 sm:h-20 flex flex-col justify-center shrink-0">
                           <div className={`w-8 sm:w-14 h-[2px] transition-all duration-500 ${status === 'APPROVED' ? 'bg-gradient-to-r from-[#00e676]/90 to-[#00e676]/40 group-hover:from-[#00e676] group-hover:to-[#00e676]/80' : status === 'REJECTED' ? 'bg-gradient-to-r from-[#ff1744]/90 to-[#ff1744]/40 group-hover:from-[#ff1744] group-hover:to-[#ff1744]/80' : 'bg-white/40'}`}></div>
                        </div>

                        <div className="flex flex-col pt-3 sm:pt-5 transition-transform duration-500 group-hover:translate-x-2">
                          <h3 className={`font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-extrabold leading-tight mb-1 drop-shadow-md ${status === 'APPROVED' ? 'text-[#00e676]' : status === 'REJECTED' ? 'text-[#ff1744]' : 'text-white'}`}>
                            {status === 'APPROVED' ? "Approved! We'll contact you later" : status === 'REJECTED' ? "Rejected. Better luck next time" : "Decision Pending"}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {application.notes && (
                      <div className="mt-8 bg-[var(--ep-accent-muted)] border border-[var(--ep-border-accent)] p-5 sm:p-6 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-700">
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
