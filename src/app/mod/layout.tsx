"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, AlertTriangle, BookOpen, FileText, LogOut, Shield,
} from "lucide-react";
import { ModLoader } from "@/components/mod-loader";
import { useEffect, useState } from "react";

// We fetch permissions from the server on mount
export default function ModLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    { href: "/mod", label: "Dashboard", icon: LayoutDashboard, perm: "view_mod_panel" },
    { href: "/mod/ban-requests", label: "Ban Requests", icon: AlertTriangle, perm: "create_ban_requests" },
    { href: "/mod/wiki", label: "Wiki", icon: BookOpen, perm: "create_wiki_items" },
    { href: "/mod/posts", label: "Posts", icon: FileText, perm: "create_posts" },
  ];

  const permissions = modInfo?.permissions || [];
  const links = allLinks.filter(
    (l) => !l.perm || permissions.includes(l.perm) || l.href === "/mod"
  );

  return (
    <>
      <ModLoader />

      <div
        className="min-h-screen flex text-white font-sans"
        style={{ background: "linear-gradient(145deg, #060a08 0%, #0a0f0c 50%, #060a08 100%)" }}
      >
        {/* Sidebar */}
        <aside
          className="w-64 flex flex-col fixed h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(12, 20, 15, 0.95) 0%, rgba(8, 12, 10, 0.98) 100%)",
            borderRight: "1px solid rgba(124, 169, 130, 0.12)",
            boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-[1px] h-full"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(124,169,130,0.2) 30%, rgba(80,160,128,0.15) 70%, transparent)",
            }}
          />

          {/* Logo & Brand */}
          <div className="p-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/alamo-logo.png"
                  alt="El Paso RP"
                  width={40}
                  height={40}
                  className="rounded-lg drop-shadow-lg"
                  style={{ width: "auto", height: "auto" }}
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-white/10" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black tracking-wider uppercase text-white/90 truncate">
                  Mod Panel
                </span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-white/30">
                  El Paso RP
                </span>
              </div>
            </div>

            {/* Mod badge */}
            <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#7ca982]/10 border border-[#7ca982]/15">
              <Shield className="w-3 h-3 text-[#7ca982]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7ca982]/80">
                {modInfo?.roleName || "Moderator"}
              </span>
            </div>
            {modInfo && (
              <p className="text-[10px] text-white/30 mt-2 truncate px-1">
                Signed in as <span className="text-white/50 font-semibold">{modInfo.modName}</span>
              </p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Navigation
            </div>
            {links.map((link, index) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/mod" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`admin-nav-slide group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive ? "text-white" : "text-white/40 hover:text-white/70"
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{
                        background: "linear-gradient(180deg, #7ca982, #50a080)",
                        boxShadow: "0 0 8px rgba(124,169,130,0.4)",
                      }}
                    />
                  )}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(124,169,130,0.1) 0%, rgba(80,160,128,0.05) 100%)",
                        border: "1px solid rgba(124,169,130,0.1)",
                      }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Icon
                    className={`relative z-10 w-[18px] h-[18px] transition-colors duration-200 ${
                      isActive ? "text-[#7ca982]" : "group-hover:text-white/60"
                    }`}
                  />
                  <span
                    className={`relative z-10 text-[13px] font-semibold transition-colors duration-200 ${
                      isActive ? "text-white" : ""
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-white/[0.06]">
            <a
              href="/mod/logout"
              className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 transition-all duration-200 hover:bg-red-500/[0.06]"
            >
              <LogOut className="w-[18px] h-[18px] transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="text-[13px] font-semibold">Logout</span>
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 ml-64 p-6 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <Image
              src="/alamo-logo.png"
              alt=""
              width={500}
              height={500}
              className="admin-watermark"
              style={{ width: "auto", height: "auto", filter: "hue-rotate(80deg)" }}
              aria-hidden="true"
            />
          </div>

          <div
            className="relative z-10 rounded-2xl min-h-[calc(100vh-3rem)] p-8"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow:
                "0 4px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              className="absolute top-0 left-8 right-8 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(124,169,130,0.2) 30%, rgba(80,160,128,0.15) 70%, transparent)",
              }}
            />
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
