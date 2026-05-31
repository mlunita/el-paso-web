import { getTranslations } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SpecialRequestsDirectory() {
  const t = await getTranslations();

  const forms = await prisma.specialRequestForm.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 relative flex justify-center mt-12 sm:mt-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--ep-accent)]/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[var(--ep-bg-hover)] border border-[var(--ep-border)] shadow-xl mb-6">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--ep-accent)] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-heading)] font-black text-white tracking-tight uppercase mb-4 drop-shadow-lg">
            {t.specialRequests.title}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--ep-text-muted)] max-w-2xl mx-auto font-medium">
            {t.specialRequests.subtitle}
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/special-requests/status">
              <Button variant="outline" className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] hover:bg-[var(--ep-bg-hover)] text-white">
                <Activity className="w-4 h-4 mr-2" />
                {t.specialRequests.statusSubtitle}
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {forms.length === 0 ? (
            <div className="ep-card-glass p-12 text-center rounded-2xl border-[var(--ep-border)]">
              <p className="text-[var(--ep-text-muted)] text-lg">{t.specialRequests.noForms}</p>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-bold text-[var(--ep-text-muted)] uppercase tracking-widest mb-4">
                {t.specialRequests.selectForm}
              </h2>
              {forms.map((form) => (
                <Link key={form.id} href={`/special-requests/${form.id}`}>
                  <div className="group ep-card-glass p-6 sm:p-8 rounded-2xl border-[var(--ep-border)] hover:border-[var(--ep-accent)] transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer flex items-center justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-[family-name:var(--font-heading)] font-bold text-white mb-2 group-hover:text-[var(--ep-accent)] transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-[var(--ep-text-muted)] text-sm sm:text-base max-w-xl">
                        {form.description || "Submit a custom request using this form."}
                      </p>
                    </div>
                    <div className="bg-[var(--ep-bg-hover)] p-3 rounded-full border border-[var(--ep-border)] group-hover:bg-[var(--ep-accent)] group-hover:border-[var(--ep-accent)] transition-all">
                      <ChevronRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
