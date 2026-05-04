"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, AlertTriangle, BookOpen, FileText, LogOut, Shield,
  Clock, ClipboardList, Search,
} from "lucide-react";
import { ModLoader } from "@/components/mod-loader";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";

export default function ModLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [modInfo, setModInfo] = useState<{
    modName: string;
    roleName: string;
    permissions: string[];
  } | null>(null);

  useEffect(() => {
    fetch("/mod/api/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.session) setModInfo(data.session);
      })
      .catch(() => {});
  }, []);

  const allLinks = [
    { href: "/mod", label: t.mod.nav.dashboard, icon: LayoutDashboard, perm: "view_mod_panel" },
    { href: "/mod/shifts", label: "Shifts", icon: Clock, perm: "manage_shifts" },
    { href: "/mod/actions", label: "Actions", icon: ClipboardList, perm: "create_mod_actions" },
    { href: "/mod/ban-requests", label: t.mod.nav.banRequests, icon: AlertTriangle, perm: "create_ban_requests" },
    { href: "/mod/roblox-lookup", label: "Roblox Lookup", icon: Search, perm: "roblox_lookup" },
    { href: "/mod/wiki", label: t.mod.nav.wiki, icon: BookOpen, perm: "create_wiki_items" },
    { href: "/mod/posts", label: t.mod.nav.posts, icon: FileText, perm: "create_posts" },
  ];

  const permissions = modInfo?.permissions || [];
  const links = allLinks.filter(
    (l) => !l.perm || permissions.includes(l.perm) || l.href === "/mod"
  );

  return (
    <>
      <ModLoader />

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
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold tracking-wide text-white truncate">
                  {t.mod.panel}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  El Paso RP
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/5">
              <Shield className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-xs font-medium text-zinc-300">
                {modInfo?.roleName || t.mod.defaultRole}
              </span>
            </div>
            {modInfo && (
              <p className="text-xs text-zinc-500 mt-2 truncate px-1">
                {t.common.signedInAs(modInfo.modName)}
              </p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t.mod.navSection}
            </div>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/mod" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-white"}`}
                  />
                  <span className="text-sm font-medium">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/5">
            <a
              href="/mod/logout"
              className="group flex items-center gap-3 w-full px-3 py-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">{t.mod.nav.logout}</span>
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 ml-64 p-8 relative overflow-hidden bg-[#0f0f12]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
