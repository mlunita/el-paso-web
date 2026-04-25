import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { FileBadge, FileText, Users, BookOpen, Shield, Key, AlertTriangle } from "lucide-react";

export default async function AdminDashboard() {
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
      label: "Applications",
      count: applicationCount,
      icon: FileBadge,
      gradient: "linear-gradient(135deg, #a67c52 0%, #8b6842 100%)",
      shadow: "rgba(166,124,82,0.25)",
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "News Posts",
      count: postCount,
      icon: FileText,
      gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      shadow: "rgba(217,119,6,0.25)",
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "Staff Members",
      count: staffCount,
      icon: Users,
      gradient: "linear-gradient(135deg, #7ca982 0%, #5d8a63 100%)",
      shadow: "rgba(124,169,130,0.25)",
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "Wiki Items",
      count: wikiCount,
      icon: BookOpen,
      gradient: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
      shadow: "rgba(146,64,14,0.25)",
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "Admins",
      count: userCount,
      icon: Shield,
      gradient: "none",
      shadow: "rgba(255,255,255,0.05)",
      iconBg: "rgba(255,255,255,0.08)",
      outline: true,
    },
    {
      label: "Active Mods",
      count: activeModCount,
      icon: Key,
      gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      shadow: "rgba(5,150,105,0.25)",
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "Pending Bans",
      count: pendingBanCount,
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      shadow: "rgba(220,38,38,0.25)",
      iconBg: "rgba(255,255,255,0.15)",
    },
    {
      label: "Roles",
      count: roleCount,
      icon: Shield,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
      shadow: "rgba(124,58,237,0.25)",
      iconBg: "rgba(255,255,255,0.15)",
    },
  ];

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-3xl font-black tracking-tight">
          Dashboard{" "}
          <span className="text-white/20 font-medium text-lg ml-2">Overview</span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          Welcome back. Here&apos;s what&apos;s happening with your community.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="admin-card-enter group relative border-0 text-white p-0 rounded-2xl overflow-hidden cursor-default"
              style={{
                animationDelay: `${index * 80}ms`,
                background: stat.outline
                  ? "rgba(255,255,255,0.03)"
                  : stat.gradient,
                boxShadow: `0 8px 32px ${stat.shadow}, 0 2px 8px rgba(0,0,0,0.2)`,
                border: stat.outline
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Hover shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 p-5 flex flex-col items-center justify-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: stat.iconBg }}
                >
                  <Icon className="w-5 h-5 text-white/90" />
                </div>
                <div className="text-4xl font-black tabular-nums">{stat.count}</div>
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
