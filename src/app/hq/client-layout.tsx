"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, LogOut, FileBadge, BookOpen, Shield, Key, KeyRound, AlertTriangle, LifeBuoy } from "lucide-react";
import { AdminLoader } from "@/components/admin-loader";
import { adminLogout } from "@/app/hq/actions";
import { useI18n } from "@/components/i18n-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const contentLinks = [
    { href: "/hq", label: t.admin.nav.dashboard, icon: LayoutDashboard, exact: true },
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
  ];

  const securityLinks = [
    { href: "/hq/admin-tokens", label: t.admin.nav.adminTokens, icon: KeyRound },
  ];

  const renderNavLink = (link: any, index: number, accentColor: string, accentGlow: string) => {
    const Icon = link.icon;
    const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`ep-nav-slide group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
          isActive ? "text-white" : "text-white/40 hover:text-white/70"
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
            style={{
              background: `linear-gradient(180deg, ${accentColor}, ${accentGlow})`,
              boxShadow: `0 0 8px ${accentColor}66`,
            }}
          />
        )}
        {isActive && (
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: `linear-gradient(90deg, ${accentColor}15 0%, ${accentGlow}08 100%)`,
              border: `1px solid ${accentColor}18`,
            }}
          />
        )}
        <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <Icon className={`relative z-10 w-[18px] h-[18px] transition-colors duration-200 ${
          isActive ? `text-[${accentColor}]` : "group-hover:text-white/60"
        }`} style={isActive ? { color: accentColor } : {}} />
        <span className={`relative z-10 text-[13px] font-semibold transition-colors duration-200 ${
          isActive ? "text-white" : ""
        }`}>
          {link.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <AdminLoader />

      <div className="min-h-screen flex text-white font-sans" style={{ background: "linear-gradient(145deg, var(--ep-bg-deep) 0%, #0d0f13 50%, var(--ep-bg-deep) 100%)" }}>
        {/* Sidebar */}
        <aside
          className="w-64 flex flex-col fixed h-full z-30"
          style={{
            background: "linear-gradient(180deg, rgba(12, 14, 18, 0.97) 0%, rgba(6, 8, 10, 0.99) 100%)",
            borderRight: "1px solid var(--ep-border)",
            boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Sidebar accent line */}
          <div
            className="absolute top-0 right-0 w-[1px] h-full"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(232,164,74,0.15) 30%, rgba(78,205,196,0.1) 70%, transparent)",
            }}
          />

          {/* Logo & Brand */}
          <div className="p-5 pb-4 border-b border-[var(--ep-border)]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/alamo-logo.png"
                  alt={t.site.name}
                  width={40}
                  height={40}
                  className="rounded-lg drop-shadow-lg"
                  style={{ width: 'auto', height: 'auto' }}
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-white/10" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-[family-name:var(--font-heading)] text-sm font-bold tracking-wider uppercase text-white/90 truncate">
                  {t.admin.panel}
                </span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-white/30">
                  El Paso RP
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--ep-accent-muted)] border border-[var(--ep-border-accent)]">
              <Shield className="w-3 h-3 text-[var(--ep-accent)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ep-accent)]">{t.admin.role}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              {t.admin.sections.management}
            </div>
            {contentLinks.map((link, i) => renderNavLink(link, i, "#e8a44a", "#4ecdc4"))}

            <div className="px-3 py-2 mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              {t.admin.sections.moderation}
            </div>
            {modLinks.map((link, i) => renderNavLink(link, i + 7, "#4ecdc4", "#22c55e"))}

            <div className="px-3 py-2 mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
              {t.admin.sections.security}
            </div>
            {securityLinks.map((link, i) => renderNavLink(link, i + 10, "#f59e0b", "#e8a44a"))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-[var(--ep-border)]">
            <button
              onClick={async () => {
                await adminLogout();
                window.location.href = "/";
              }}
              className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-white/30 hover:text-red-400 transition-all duration-200 hover:bg-red-500/[0.06]"
            >
              <LogOut className="w-[18px] h-[18px] transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="text-[13px] font-semibold">{t.admin.nav.logout}</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <Image
              src="/alamo-logo.png"
              alt=""
              width={500}
              height={500}
              className="ep-watermark"
              style={{ width: 'auto', height: 'auto' }}
              aria-hidden="true"
            />
          </div>

          <div
            className="relative z-10 rounded-2xl min-h-[calc(100vh-3rem)] p-8"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--ep-border)",
              boxShadow: "0 4px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div
              className="absolute top-0 left-8 right-8 h-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(232,164,74,0.15) 30%, rgba(78,205,196,0.1) 70%, transparent)",
              }}
            />
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
