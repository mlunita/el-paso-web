import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { FileBadge, FileText, Users, BookOpen, Shield, Key, AlertTriangle } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";

export default async function AdminDashboard() {
  const t = await getTranslations();
  const [userCount, postCount, applicationCount, staffCount, wikiCount, activeModCount, pendingBanCount, roleCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.application.count(),
    prisma.staffMember.count(),
    prisma.wikiItem.count(),
    prisma.moderatorToken.count({ where: { status: "ACTIVE" } }),
    prisma.banRequest.count({ where: { status: "PENDING" } }),
    prisma.role.count(),
  ]);

  const stats = [
    { label: t.admin.dashboard.stats.applications, count: applicationCount, icon: FileBadge },
    { label: t.admin.dashboard.stats.newsPosts, count: postCount, icon: FileText },
    { label: t.admin.dashboard.stats.staffMembers, count: staffCount, icon: Users },
    { label: t.admin.dashboard.stats.wikiItems, count: wikiCount, icon: BookOpen },
    { label: t.admin.dashboard.stats.admins, count: userCount, icon: Shield },
    { label: t.admin.dashboard.stats.activeMods, count: activeModCount, icon: Key },
    { label: t.admin.dashboard.stats.pendingBans, count: pendingBanCount, icon: AlertTriangle },
    { label: t.admin.dashboard.stats.roles, count: roleCount, icon: Shield },
  ];

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8 pb-6 border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {t.admin.dashboard.title}{" "}
          <span className="text-zinc-500 font-medium text-lg ml-2">{t.admin.dashboard.overview}</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1.5">
          {t.admin.dashboard.welcome}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
