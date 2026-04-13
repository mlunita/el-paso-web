import { getModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, XCircle, Shield } from "lucide-react";

export default async function ModDashboard() {
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
      label: "Total Requests",
      count: totalRequests,
      icon: AlertTriangle,
      gradient: "linear-gradient(135deg, #7ca982 0%, #5d8a63 100%)",
      shadow: "rgba(124,169,130,0.25)",
    },
    {
      label: "Pending",
      count: pendingCount,
      icon: Clock,
      gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      shadow: "rgba(217,119,6,0.25)",
    },
    {
      label: "Approved",
      count: approvedCount,
      icon: CheckCircle,
      gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      shadow: "rgba(5,150,105,0.25)",
    },
    {
      label: "Rejected",
      count: rejectedCount,
      icon: XCircle,
      gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      shadow: "rgba(220,38,38,0.25)",
    },
  ];

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-white/[0.06]">
        <h1 className="text-3xl font-black tracking-tight">
          Welcome back,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7ca982] to-[#50a080]">
            {session.modName}
          </span>
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7ca982]/10 border border-[#7ca982]/15">
            <Shield className="w-3 h-3 text-[#7ca982]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7ca982]/80">
              {session.roleName}
            </span>
          </div>
          <span className="text-white/20 text-sm">ID: {session.modId}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="admin-card-enter group relative border-0 text-white p-0 rounded-2xl overflow-hidden cursor-default"
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
                <div className="text-4xl font-black tabular-nums">{stat.count}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                  {stat.label}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Permissions overview */}
      <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
        <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">
          Your Permissions
        </h2>
        <div className="flex flex-wrap gap-2">
          {session.permissions.map((perm) => (
            <span
              key={perm}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#7ca982]/15 text-[#9fcba5] text-xs font-semibold border border-[#7ca982]/15"
            >
              {perm.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
