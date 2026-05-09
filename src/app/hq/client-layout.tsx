"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, LogOut, FileBadge, BookOpen, Shield, Key, KeyRound, AlertTriangle, LifeBuoy, BarChart3, Clock, ClipboardList, Search, TrendingUp, Trophy, Database } from "lucide-react";
import { AdminLoader } from "@/components/admin-loader";
import { adminLogout } from "@/app/hq/actions";
import { useI18n } from "@/components/i18n-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const contentLinks = [
    { href: "/hq", label: t.admin.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/hq/analytics", label: t.admin.nav.analytics, icon: BarChart3 },
    { href: "/hq/posts", label: t.admin.nav.posts, icon: FileText },
    { href: "/hq/support", label: t.admin.nav.support, icon: LifeBuoy },
    { href: "/hq/applications", label: t.admin.nav.applications, icon: FileBadge },
    { href: "/hq/staff", label: t.admin.nav.staff, icon: Users },
    { href: "/hq/wiki", label: t.admin.nav.wiki, icon: BookOpen },
    { href: "/hq/settings", label: t.admin.nav.settings, icon: Settings },
  ];

  const modLinks = [
    { href: "/hq/roles", label: t.admin.nav.roles, icon: Shield },
    { href: "/hq/tokens", label: t.admin.nav.tokens, icon: Key },
    { href: "/hq/ban-requests", label: t.admin.nav.banRequests, icon: AlertTriangle },
    { href: "/hq/banned-users", label: "Player Database", icon: Database },
    { href: "/hq/shifts", label: "Shifts", icon: Clock },
    { href: "/hq/shift-hours", label: "Shift Hours", icon: Clock },
    { href: "/hq/shift-reset", label: "Reset Shifts", icon: AlertTriangle },
    { href: "/hq/mod-actions", label: "Mod Actions", icon: ClipboardList },
    { href: "/hq/roblox-lookup", label: "Roblox Lookup", icon: Search },
    { href: "/hq/staff-analytics", label: "Staff Analytics", icon: TrendingUp },
    { href: "/hq/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const securityLinks = [
    { href: "/hq/admin-tokens", label: t.admin.nav.adminTokens, icon: KeyRound },
  ];

  const renderNavLink = (link: any, index: number) => {
    const Icon = link.icon;
    const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
          isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-white"}`} />
        <span className="text-sm font-medium">
          {link.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <AdminLoader />

      <div className="min-h-screen flex bg-[#0f0f12] text-white font-sans roblox-theme">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col fixed h-full z-30 bg-[#1c1c1f] border-r border-white/5">
          {/* Logo & Brand */}
          <div className="p-5 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/alamo-logo.png"
                  alt={t.site.name}
                  width={32}
                  height={32}
                  className="rounded"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold tracking-wide text-white truncate">
                  {t.admin.panel}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  El Paso RP
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/5">
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-xs font-medium text-zinc-300">{t.admin.role}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t.admin.sections.management}
            </div>
            {contentLinks.map((link, i) => renderNavLink(link, i))}

            <div className="px-3 py-2 mt-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t.admin.sections.moderation}
            </div>
            {modLinks.map((link, i) => renderNavLink(link, i))}

            <div className="px-3 py-2 mt-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t.admin.sections.security}
            </div>
            {securityLinks.map((link, i) => renderNavLink(link, i))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={async () => {
                await adminLogout();
                window.location.href = "/";
              }}
              className="group flex items-center gap-3 w-full px-3 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">{t.admin.nav.logout}</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 relative overflow-hidden bg-[#0f0f12]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
