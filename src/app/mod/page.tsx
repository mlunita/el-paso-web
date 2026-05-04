import { getModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
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
    { label: t.mod.dashboard.stats.totalRequests, count: totalRequests, icon: AlertTriangle },
    { label: t.mod.dashboard.stats.pending, count: pendingCount, icon: Clock },
    { label: t.mod.dashboard.stats.approved, count: approvedCount, icon: CheckCircle },
    { label: t.mod.dashboard.stats.rejected, count: rejectedCount, icon: XCircle },
  ];

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t.mod.dashboard.welcome("")}{" "}
          <span className="text-zinc-300">
            {session.modName}
          </span>
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
            <Shield className="w-3.5 h-3.5 text-zinc-300" />
            <span className="text-xs font-semibold text-zinc-300">
              {session.roleName}
            </span>
          </div>
          <span className="text-zinc-500 text-sm">{t.common.id(session.modId)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 truncate">
                  {stat.label}
                </div>
              </div>
              <div className="text-3xl font-bold text-white tabular-nums">{stat.count}</div>
            </div>
          );
        })}
      </div>

      {/* Permissions overview */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-white/5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
          {t.mod.dashboard.permissions}
        </h2>
        <div className="flex flex-wrap gap-2">
          {session.permissions.map((perm) => (
            <span
              key={perm}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-white/5 text-zinc-300 text-xs font-medium border border-white/5"
            >
              {perm.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
