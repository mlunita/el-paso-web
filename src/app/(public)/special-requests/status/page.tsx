import { getTranslations } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { CheckSpecialStatusForm } from "./client-form";
import { CheckCircle2, XCircle, ClipboardList, Hourglass, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SpecialRequestStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const t = await getTranslations();
  const resolvedSearchParams = await searchParams;
  const refCode = resolvedSearchParams.ref?.toUpperCase().trim();

  const submission = refCode
    ? await prisma.specialRequestSubmission.findUnique({
        where: { refCode },
        include: { form: true },
      })
    : null;

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 relative flex justify-center overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[var(--ep-accent)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col pt-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[var(--ep-bg-hover)] border border-[var(--ep-border)] shadow-xl mb-6 relative">
            <div className="absolute inset-0 bg-[var(--ep-accent)]/20 blur-xl rounded-full" />
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--ep-accent)] relative z-10" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-heading)] font-black text-white tracking-tight uppercase mb-4 drop-shadow-lg">
            {t.specialRequests.statusTitle}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--ep-text-muted)] max-w-2xl mx-auto font-medium">
            {t.specialRequests.statusSubtitle}
          </p>
        </div>

        <CheckSpecialStatusForm />

        {refCode && (
          <div className="mt-8 sm:mt-12 w-full animate-in slide-in-from-bottom-4 duration-500">
            {submission ? (() => {
              const status = submission.status;
              const isReviewed = status === "REVIEWED" || status === "APPROVED" || status === "REJECTED";
              const isFinalized = status === "APPROVED" || status === "REJECTED";

              return (
                <div className="ep-card-glass rounded-2xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden border-[var(--ep-border)]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ep-accent)]/[0.03] rounded-full blur-[80px] pointer-events-none" />

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 border-b border-[var(--ep-border)] pb-6 gap-4">
                    <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-widest text-[var(--ep-text-muted)] flex items-center gap-3">
                      <div className="h-[2px] w-6 bg-[var(--ep-accent)] rounded-full" />
                      {submission.form.title}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--ep-text-muted)]">
                        {t.applicationStatus?.applicant || "APPLICANT"}:
                      </span>
                      <span className="text-lg font-bold text-[var(--ep-text-primary)] px-3 py-1 bg-[var(--ep-bg-hover)] rounded-md border border-[var(--ep-border)]">{submission.discord}</span>
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
                          Your request was sent
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
                          Your request was reviewed by a high rank
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

                  {submission.notes && (
                    <div className="mt-8 bg-[var(--ep-accent-muted)] border border-[var(--ep-border-accent)] p-5 sm:p-6 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-700">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-[2px] w-4 bg-[var(--ep-accent)]/50 rounded-full" />
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--ep-accent)]">
                          {t.applicationStatus?.adminResponse || "ADMIN RESPONSE"}
                        </span>
                      </div>
                      <p className="text-[var(--ep-text-secondary)] italic leading-relaxed">{submission.notes}</p>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="ep-card-glass p-8 sm:p-12 text-center rounded-2xl border-[var(--ep-border)]">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6 drop-shadow-lg" />
                <h3 className="text-2xl font-bold text-white mb-2">Request Not Found</h3>
                <p className="text-[var(--ep-text-muted)] max-w-md mx-auto">
                  We couldn't find a special request with that reference code. Please check the code and try again.
                </p>
                <div className="mt-8">
                  <Link href="/special-requests">
                    <Button variant="outline" className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] hover:bg-[var(--ep-bg-hover)] text-white">
                      View Available Forms
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
