"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, LogOut, FileBadge, BookOpen, Shield, Key, KeyRound, AlertTriangle, LifeBuoy } from "lucide-react";
import { AdminLoader } from "@/components/admin-loader";
import { adminLogout } from "@/app/hq/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const contentLinks = [
    { href: "/hq", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/hq/posts", label: "News Posts", icon: FileText },
    { href: "/hq/support", label: "Support", icon: LifeBuoy },
    { href: "/hq/applications", label: "Applications", icon: FileBadge },
    { href: "/hq/staff", label: "Staff", icon: Users },
    { href: "/hq/wiki", label: "Wiki", icon: BookOpen },
    { href: "/hq/settings", label: "Site Settings", icon: Settings },
  ];

  const modLinks = [
    { href: "/hq/roles", label: "Roles", icon: Shield },
    { href: "/hq/tokens", label: "Mod Tokens", icon: Key },
    { href: "/hq/ban-requests", label: "Ban Requests", icon: AlertTriangle },
  ];

  const securityLinks = [
    { href: "/hq/admin-tokens", label: "Admin Tokens", icon: KeyRound },
  ];

  return (
    <>
      {/* Loading screen — always mounts on layout render, self-manages 2s timer */}
      <AdminLoader />

      <div className="min-h-screen flex text-white font-sans" style={{ background: "linear-gradient(145deg, #0a0a0a 0%, #0f0d0b 50%, #0a0c0a 100%)" }}>
        {/* ===== Sidebar ===== */}
        <aside
          className="w-64 flex flex-col fixed h-full"
          style={{
            background: "linear-gradient(180deg, rgba(20, 18, 15, 0.95) 0%, rgba(12, 12, 12, 0.98) 100%)",
            borderRight: "1px solid rgba(166, 124, 82, 0.12)",
            boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
          }}
        >
          {/* Sidebar accent line */}
          <div
            className="absolute top-0 right-0 w-[1px] h-full"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(166,124,82,0.2) 30%, rgba(124,169,130,0.15) 70%, transparent)",
            }}
          />

          {/* Logo & Brand Header */}
          <div className="p-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/alamo-logo.png"
                  alt="El Paso RP"
                  width={40}
                  height={40}
                  className="rounded-lg drop-shadow-lg"
                  style={{ width: 'auto', height: 'auto' }}
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-white/10" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black tracking-wider uppercase text-white/90 truncate">
                  Admin Panel
                </span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-white/30">
                  El Paso RP
                </span>
              </div>
            </div>

            {/* Admin badge */}
            <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#a67c52]/10 border border-[#a67c52]/15">
              <Shield className="w-3 h-3 text-[#a67c52]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a67c52]/80">Administrator</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Management
            </div>
            {contentLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`admin-nav-slide group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{
                        background: "linear-gradient(180deg, #a67c52, #7ca982)",
                        boxShadow: "0 0 8px rgba(166,124,82,0.4)",
                      }}
                    />
                  )}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(90deg, rgba(166,124,82,0.1) 0%, rgba(124,169,130,0.05) 100%)",
                        border: "1px solid rgba(166,124,82,0.1)",
                      }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Icon className={`relative z-10 w-[18px] h-[18px] transition-colors duration-200 ${
                    isActive ? "text-[#c9a87c]" : "group-hover:text-white/60"
                  }`} />
                  <span className={`relative z-10 text-[13px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-white" : ""
                  }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {/* Moderation Section */}
            <div className="px-3 py-2 mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Moderation
            </div>
            {modLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`admin-nav-slide group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  style={{ animationDelay: `${(index + 6) * 60}ms` }}
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
                        background: "linear-gradient(90deg, rgba(124,169,130,0.1) 0%, rgba(80,160,128,0.05) 100%)",
                        border: "1px solid rgba(124,169,130,0.1)",
                      }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Icon className={`relative z-10 w-[18px] h-[18px] transition-colors duration-200 ${
                    isActive ? "text-[#7ca982]" : "group-hover:text-white/60"
                  }`} />
                  <span className={`relative z-10 text-[13px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-white" : ""
                  }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
            {/* Security Section */}
            <div className="px-3 py-2 mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              Security
            </div>
            {securityLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`admin-nav-slide group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  style={{ animationDelay: `${(index + 9) * 60}ms` }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{
                        background: "linear-gradient(180deg, #d97706, #a67c52)",
                        boxShadow: "0 0 8px rgba(217,119,6,0.4)",
                      }}
                    />
                  )}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(90deg, rgba(217,119,6,0.1) 0%, rgba(166,124,82,0.05) 100%)",
                        border: "1px solid rgba(217,119,6,0.1)",
                      }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Icon className={`relative z-10 w-[18px] h-[18px] transition-colors duration-200 ${
                    isActive ? "text-amber-500" : "group-hover:text-white/60"
                  }`} />
                  <span className={`relative z-10 text-[13px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-white" : ""
                  }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-3 border-t border-white/[0.06]">
            <button
              onClick={async () => {
                await adminLogout();
                window.location.href = "/";
              }}
              className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 transition-all duration-200 hover:bg-red-500/[0.06]"
            >
              <LogOut className="w-[18px] h-[18px] transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="text-[13px] font-semibold">Logout</span>
            </button>
          </div>
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1 ml-64 p-6 relative overflow-hidden">
          {/* Background watermark logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <Image
              src="/alamo-logo.png"
              alt=""
              width={500}
              height={500}
              className="admin-watermark"
              style={{ width: 'auto', height: 'auto' }}
              aria-hidden="true"
            />
          </div>

          {/* Content container */}
          <div
            className="relative z-10 rounded-2xl min-h-[calc(100vh-3rem)] p-8"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 4px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            {/* Top decorative gradient line */}
            <div
              className="absolute top-0 left-8 right-8 h-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(166,124,82,0.2) 30%, rgba(124,169,130,0.15) 70%, transparent)",
              }}
            />
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
