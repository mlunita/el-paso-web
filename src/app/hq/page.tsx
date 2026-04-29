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
    {
      label: t.admin.dashboard.stats.applications,
      count: applicationCount,
      icon: FileBadge,
      gradient: "linear-gradient(135deg, #e8a44a 0%, #c4882e 100%)",
      shadow: "rgba(232,164,74,0.3)",
    },
    {
      label: t.admin.dashboard.stats.newsPosts,
      count: postCount,
      icon: FileText,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      shadow: "rgba(245,158,11,0.3)",
    },
    {
      label: t.admin.dashboard.stats.staffMembers,
      count: staffCount,
      icon: Users,
      gradient: "linear-gradient(135deg, #4ecdc4 0%, #36b3aa 100%)",
      shadow: "rgba(78,205,196,0.3)",
    },
    {
      label: t.admin.dashboard.stats.wikiItems,
      count: wikiCount,
      icon: BookOpen,
      gradient: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
      shadow: "rgba(180,83,9,0.3)",
    },
    {
      label: t.admin.dashboard.stats.admins,
      count: userCount,
      icon: Shield,
      gradient: "none",
      shadow: "rgba(255,255,255,0.05)",
      outline: true,
    },
    {
      label: t.admin.dashboard.stats.activeMods,
      count: activeModCount,
      icon: Key,
      gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      shadow: "rgba(34,197,94,0.3)",
    },
    {
      label: t.admin.dashboard.stats.pendingBans,
      count: pendingBanCount,
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      shadow: "rgba(239,68,68,0.3)",
    },
    {
      label: t.admin.dashboard.stats.roles,
      count: roleCount,
      icon: Shield,
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      shadow: "rgba(139,92,246,0.3)",
    },
  ];

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          {t.admin.dashboard.title}{" "}
          <span className="text-white/20 font-medium text-lg ml-2">{t.admin.dashboard.overview}</span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          {t.admin.dashboard.welcome}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="ep-card-enter group relative border-0 text-white p-0 rounded-2xl overflow-hidden cursor-default"
              style={{
                animationDelay: `${index * 80}ms`,
                background: stat.outline
                  ? "rgba(255,255,255,0.03)"
                  : stat.gradient,
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
    </div>
  );
}
