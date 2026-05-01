import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Headset, AlertTriangle, AlertOctagon, Flame, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const TICKET_STATUS_ORDER = ["GREEN", "YELLOW", "ORANGE", "RED"] as const;
type TicketStatusKey = typeof TICKET_STATUS_ORDER[number];

function buildTicketStatusTicks(currentStatus: TicketStatusKey): TicketStatusKey[] {
  const ticks = Array<TicketStatusKey>(76).fill("GREEN");
  const setTicks = (indexes: number[], status: TicketStatusKey) => {
    indexes.forEach((index) => {
      ticks[index] = status;
    });
  };

  setTicks([6, 24, 35, 52], "YELLOW");
  setTicks([12, 40], "ORANGE");

  if (currentStatus === "YELLOW") {
    for (let i = 60; i < ticks.length; i += 1) ticks[i] = "YELLOW";
    setTicks([66, 72], "ORANGE");
  }

  if (currentStatus === "ORANGE") {
    for (let i = 54; i < 63; i += 1) ticks[i] = "YELLOW";
    for (let i = 63; i < ticks.length; i += 1) ticks[i] = "ORANGE";
    setTicks([69, 73], "RED");
  }

  if (currentStatus === "RED") {
    for (let i = 46; i < 57; i += 1) ticks[i] = "YELLOW";
    for (let i = 57; i < 66; i += 1) ticks[i] = "ORANGE";
    for (let i = 66; i < ticks.length; i += 1) ticks[i] = "RED";
  }

  ticks[ticks.length - 1] = currentStatus;
  return ticks;
}

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
  const timelineCopy = t.ticketStatus.timeline;
  const statusConfig: Record<TicketStatusKey, {
    color: string;
    bg: string;
    fill: string;
    border: string;
    glow: string;
    icon: LucideIcon;
    label: string;
    message: string;
  }> = {
    GREEN: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/5",
      fill: "bg-emerald-500",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
      icon: CheckCircle2,
      label: statusCopy.GREEN.label,
      message: statusCopy.GREEN.message,
    },
    YELLOW: {
      color: "text-yellow-400",
      bg: "bg-yellow-500/5",
      fill: "bg-yellow-500",
      border: "border-yellow-500/20",
      glow: "shadow-yellow-500/10",
      icon: AlertTriangle,
      label: statusCopy.YELLOW.label,
      message: statusCopy.YELLOW.message,
    },
    ORANGE: {
      color: "text-orange-400",
      bg: "bg-orange-500/5",
      fill: "bg-orange-500",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/10",
      icon: AlertOctagon,
      label: statusCopy.ORANGE.label,
      message: statusCopy.ORANGE.message,
    },
    RED: {
      color: "text-red-400",
      bg: "bg-red-500/5",
      fill: "bg-red-500",
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

  const normalizedStatus = TICKET_STATUS_ORDER.includes(ticketStatus as TicketStatusKey)
    ? ticketStatus as TicketStatusKey
    : "GREEN";
  const activeStatusIndex = TICKET_STATUS_ORDER.indexOf(normalizedStatus);
  const config = statusConfig[normalizedStatus];
  const StatusIcon = config.icon;
  const statusTicks = buildTicketStatusTicks(normalizedStatus);

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

              <div className="w-full mt-4 rounded-2xl border border-[var(--ep-border)] bg-[var(--ep-bg-deep)]/35 p-4 sm:p-5">
                <div className="flex flex-col gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-[var(--ep-text-muted)]" aria-hidden="true">&gt;</span>
                    <h2 className="font-[family-name:var(--font-heading)] text-sm font-extrabold text-[var(--ep-text-primary)] sm:text-base">
                      {timelineCopy.title}
                    </h2>
                  </div>
                  <span className={`shrink-0 pl-4 text-xs font-semibold sm:pl-0 sm:text-sm ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                <div
                  className="mt-3 grid h-9 items-center gap-1"
                  style={{ gridTemplateColumns: `repeat(${statusTicks.length}, minmax(0, 1fr))` }}
                  aria-label={`${timelineCopy.title}: ${config.label}`}
                >
                  {statusTicks.map((status, index) => {
                    const step = statusConfig[status];
                    return (
                      <span
                        key={`${status}-${index}`}
                        className={`h-8 min-w-[2px] rounded-full ${step.fill} ${
                          index === statusTicks.length - 1 ? "ring-2 ring-white/40 ring-offset-2 ring-offset-[var(--ep-bg-deep)]" : ""
                        }`}
                        title={step.label}
                      />
                    );
                  })}
                </div>

                <div className="mt-2 flex justify-between text-xs font-medium text-[var(--ep-text-muted)]">
                  <span>{timelineCopy.earlier}</span>
                  <span>{timelineCopy.today}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TICKET_STATUS_ORDER.map((key, index) => {
                    const step = statusConfig[key];
                    const StepIcon = step.icon;
                    const isCurrent = index === activeStatusIndex;

                    return (
                      <div
                        key={key}
                        className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center sm:min-h-0 sm:flex-row sm:justify-start sm:text-left ${
                          isCurrent ? `${step.bg} ${step.border}` : "border-[var(--ep-border)] bg-[var(--ep-bg-surface)]/60"
                        }`}
                      >
                        <StepIcon className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? step.color : "text-[var(--ep-text-muted)]"}`} />
                        <span className={`text-[10px] font-bold uppercase leading-tight tracking-widest ${isCurrent ? step.color : "text-[var(--ep-text-muted)]"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 ep-fade-up" style={{ animationDelay: "300ms" }}>
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = key === normalizedStatus;
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
