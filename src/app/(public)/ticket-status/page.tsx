import { prisma } from "@/lib/prisma";
import { Headset, AlertTriangle, AlertOctagon, Flame, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, {
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
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    icon: CheckCircle2,
    label: "All Clear",
    message: "Tickets run normally, support is available.",
  },
  YELLOW: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/20",
    icon: AlertTriangle,
    label: "Minor Delays",
    message: "We are experiencing difficulties with tickets. Response time may take more than 30 minutes.",
  },
  ORANGE: {
    color: "text-orange-400",
    bg: "bg-orange-500/5",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    icon: AlertOctagon,
    label: "High Volume",
    message: "We are receiving a high volume of tickets. Response time may take up to 2 hours.",
  },
  RED: {
    color: "text-red-400",
    bg: "bg-red-500/5",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    icon: Flame,
    label: "Overloaded",
    message: "We are overloaded with tickets and are prioritizing cheater reports. Response time may take up to 1 day, or your ticket may be closed for this reason.",
  },
};

export default async function TicketStatusPage() {
  let ticketStatus = "GREEN";
  try {
    const settings = await prisma.siteSettings.findFirst();
    if (settings?.ticketStatus) {
      ticketStatus = settings.ticketStatus;
    }
  } catch (e) {
    // ignore
  }

  const config = STATUS_CONFIG[ticketStatus] || STATUS_CONFIG.GREEN;
  const StatusIcon = config.icon;

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto pt-8">
      <div className="text-center mb-4 animate-fade-in-up">
        <div className="relative inline-flex items-center justify-center p-4 rounded-full mb-6">
          <div className={`absolute inset-0 ${config.bg} rounded-full animate-pulse-glow`} />
          <div className={`relative ${config.bg} p-4 rounded-full border ${config.border}`}>
            <Headset className={`w-10 h-10 ${config.color}`} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mb-4">
          Ticket Support Status
        </h1>
        <p className="text-zinc-500 text-lg">Real-time overview of our support ticket system.</p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <div className={`glass-card-strong rounded-3xl p-8 md:p-12 shadow-2xl ${config.glow} shadow-lg relative overflow-hidden border ${config.border}`}>
          {/* Background glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${config.bg} rounded-full blur-[80px] pointer-events-none`} />
          <div className={`absolute -bottom-[20%] -left-[10%] w-48 h-48 ${config.bg} rounded-full blur-[60px] pointer-events-none`} />

          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {/* Status indicator */}
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl ${config.bg} border ${config.border}`}>
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color.replace("text-", "bg-")} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color.replace("text-", "bg-")}`}></span>
              </span>
              <StatusIcon className={`w-6 h-6 ${config.color}`} />
              <span className={`text-lg font-black uppercase tracking-widest ${config.color}`}>
                {config.label}
              </span>
            </div>

            {/* Message */}
            <p className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
              {config.message}
            </p>

            {/* Status bar */}
            <div className="w-full max-w-md mt-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
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

      {/* Info cards below */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isActive = key === ticketStatus;
          return (
            <div
              key={key}
              className={`rounded-xl p-4 text-center border transition-all duration-300 ${
                isActive
                  ? `${cfg.bg} ${cfg.border} shadow-lg ${cfg.glow}`
                  : "glass-card opacity-50"
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-2 ${isActive ? cfg.color : "text-zinc-600"}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isActive ? cfg.color : "text-zinc-600"}`}>
                {key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
