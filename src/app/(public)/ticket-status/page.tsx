import type { Metadata } from "next";
import { Headset, AlertTriangle, AlertOctagon, Flame, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();

  return createLocalizedMetadata({
    locale,
    path: "/ticket-status",
    title: t.seo.pages.tickets.title,
    description: t.seo.pages.tickets.description,
    twitterCard: "summary",
  });
}

export default async function TicketStatusPage() {
  const t = await getTranslations();
  const statusCopy = t.ticketStatus.statuses;
  const statusConfig: Record<string, {
    color: string;
    bg: string;
    border: string;
    glow: string;
    icon: any;
    label: string;
    message: string;
  }> = {
    GREEN: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
      icon: CheckCircle2,
      label: statusCopy.GREEN.label,
      message: statusCopy.GREEN.message,
    },
    YELLOW: {
      color: "text-yellow-400",
      bg: "bg-yellow-500/5",
      border: "border-yellow-500/20",
      glow: "shadow-yellow-500/10",
      icon: AlertTriangle,
      label: statusCopy.YELLOW.label,
      message: statusCopy.YELLOW.message,
    },
    ORANGE: {
      color: "text-orange-400",
      bg: "bg-orange-500/5",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/10",
      icon: AlertOctagon,
      label: statusCopy.ORANGE.label,
      message: statusCopy.ORANGE.message,
    },
    RED: {
      color: "text-red-400",
      bg: "bg-red-500/5",
      border: "border-red-500/20",
      glow: "shadow-red-500/10",
      icon: Flame,
      label: statusCopy.RED.label,
      message: statusCopy.RED.message,
    },
  };

  let ticketStatus = "GREEN";
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings?.ticketStatus) ticketStatus = settings.ticketStatus;
  } catch {}

  const config = statusConfig[ticketStatus] || statusConfig.GREEN;
  const StatusIcon = config.icon;

  return (
    <div className="ep-section py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 ep-fade-up">
          <div className="relative inline-flex items-center justify-center p-4 rounded-full mb-6">
            <div className={`absolute inset-0 ${config.bg} rounded-full ep-glow-pulse`} />
            <div className={`relative ${config.bg} p-4 rounded-full border ${config.border}`}>
              <Headset className={`w-10 h-10 ${config.color}`} />
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--ep-text-primary)] mb-4">
            {t.ticketStatus.heading}
          </h1>
          <p className="text-[var(--ep-text-secondary)] text-lg">{t.ticketStatus.subtitle}</p>
        </div>

        <div className="ep-fade-up" style={{ animationDelay: "150ms" }}>
          <div className={`ep-card-elevated rounded-2xl p-8 md:p-12 shadow-2xl ${config.glow} shadow-lg relative overflow-hidden border ${config.border}`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${config.bg} rounded-full blur-[80px] pointer-events-none`} />
            <div className={`absolute -bottom-[20%] -left-[10%] w-48 h-48 ${config.bg} rounded-full blur-[60px] pointer-events-none`} />

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${config.bg} border ${config.border}`}>
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color.replace("text-", "bg-")} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color.replace("text-", "bg-")}`} />
                </span>
                <StatusIcon className={`w-6 h-6 ${config.color}`} />
                <span className={`font-[family-name:var(--font-heading)] text-lg font-extrabold uppercase tracking-widest ${config.color}`}>
                  {config.label}
                </span>
              </div>

              <p className="text-[var(--ep-text-secondary)] text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                {config.message}
              </p>

              <div className="w-full max-w-md mt-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--ep-text-muted)] mb-2">
                  <span>{t.ticketStatus.levels.low}</span>
                  <span>{t.ticketStatus.levels.high}</span>
                </div>
                <div className="w-full h-2 bg-[var(--ep-bg-deep)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      ticketStatus === "GREEN" ? "w-1/4 bg-emerald-500" :
                      ticketStatus === "YELLOW" ? "w-2/4 bg-yellow-500" :
                      ticketStatus === "ORANGE" ? "w-3/4 bg-orange-500" :
                      "w-full bg-red-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 ep-fade-up" style={{ animationDelay: "300ms" }}>
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = key === ticketStatus;
            return (
              <div
                key={key}
                className={`rounded-xl p-4 text-center border transition-all duration-300 ${
                  isActive ? `${cfg.bg} ${cfg.border} shadow-lg ${cfg.glow}` : "ep-card opacity-50"
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-2 ${isActive ? cfg.color : "text-[var(--ep-text-muted)]"}`} />
                <span className={`text-xs font-extrabold uppercase tracking-widest ${isActive ? cfg.color : "text-[var(--ep-text-muted)]"}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
