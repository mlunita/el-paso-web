import { getModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, XCircle, Shield } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";

export default async function ModDashboard() {
  const t = await getTranslations();
  const session = await getModSession();
  if (!session) redirect("/mod-login");

  const [totalRequests, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.banRequest.count({ where: { tokenId: session.tokenId } }),
    prisma.banRequest.count({ where: { tokenId: session.tokenId, status: "PENDING" } }),
    prisma.banRequest.count({ where: { tokenId: session.tokenId, status: "APPROVED" } }),
    prisma.banRequest.count({ where: { tokenId: session.tokenId, status: "REJECTED" } }),
  ]);

  const stats = [
    {
      label: t.mod.dashboard.stats.totalRequests,
      count: totalRequests,
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, #4ecdc4 0%, #36b3aa 100%)",
      shadow: "rgba(78,205,196,0.3)",
    },
    {
      label: t.mod.dashboard.stats.pending,
      count: pendingCount,
      icon: Clock,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      shadow: "rgba(245,158,11,0.3)",
    },
    {
      label: t.mod.dashboard.stats.approved,
      count: approvedCount,
      icon: CheckCircle,
      gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      shadow: "rgba(34,197,94,0.3)",
    },
    {
      label: t.mod.dashboard.stats.rejected,
      count: rejectedCount,
      icon: XCircle,
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      shadow: "rgba(239,68,68,0.3)",
    },
  ];

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          {t.mod.dashboard.welcome("")}{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--ep-secondary)] to-emerald-400">
            {session.modName}
          </span>
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--ep-secondary-muted)] border border-[var(--ep-secondary)]/15">
            <Shield className="w-3 h-3 text-[var(--ep-secondary)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ep-secondary)]">
              {session.roleName}
            </span>
          </div>
          <span className="text-white/20 text-sm">{t.common.id(session.modId)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="ep-card-enter group relative border-0 text-white p-0 rounded-2xl overflow-hidden cursor-default"
              style={{
                animationDelay: `${index * 80}ms`,
                background: stat.gradient,
                boxShadow: `0 8px 32px ${stat.shadow}, 0 2px 8px rgba(0,0,0,0.2)`,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 p-5 flex flex-col items-center justify-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Icon className="w-5 h-5 text-white/90" />
                </div>
                <div className="text-4xl font-extrabold tabular-nums">{stat.count}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                  {stat.label}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Permissions overview */}
      <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
        <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold text-white/50 uppercase tracking-wider mb-3">
          {t.mod.dashboard.permissions}
        </h2>
        <div className="flex flex-wrap gap-2">
          {session.permissions.map((perm) => (
            <span
              key={perm}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[var(--ep-secondary-muted)] text-[var(--ep-secondary)] text-xs font-semibold border border-[var(--ep-secondary)]/15"
            >
              {perm.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
