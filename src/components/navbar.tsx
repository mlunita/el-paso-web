"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/components/i18n-provider";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/news", label: t.nav.news },
    { href: "/wiki", label: t.nav.wiki },
    { href: "/team", label: t.nav.team },
    { href: "/database", label: "Database" },
    { href: "/ticket-status", label: t.nav.tickets },
    { href: "/special-requests", label: t.specialRequests?.title || "Special Requests" },
    { href: "/blacklist", label: "Blacklist" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        role="navigation"
        aria-label={t.nav.mainNavigation}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--ep-bg-deep)]/90 backdrop-blur-xl border-b border-[var(--ep-border)] shadow-lg shadow-black/20"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-18 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label={t.nav.homeAria}>
              <div className="relative w-10 h-10 shrink-0">
                <Image src="/logo.png" alt={t.site.logoAlt} fill className="object-contain" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-[family-name:var(--font-heading)] text-sm font-bold tracking-wider uppercase text-[var(--ep-text-primary)] group-hover:text-[var(--ep-accent)] transition-colors duration-300">
                  {t.site.name}
                </span>
                <span className="text-[10px] font-medium tracking-widest uppercase text-[var(--ep-text-muted)]">
                  {t.site.tagline}
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" || pathname === "/es" : pathname.startsWith(link.href) || pathname.startsWith(`/es${link.href}`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-[13px] font-semibold tracking-wide uppercase transition-colors duration-300 ${
                      isActive
                        ? "text-[var(--ep-accent)]"
                        : "text-[var(--ep-text-secondary)] hover:text-[var(--ep-text-primary)]"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-[var(--ep-accent)] transition-all duration-300 ${
                        isActive ? "w-3/4" : "w-0"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              <Link
                href="/applys"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold uppercase tracking-wider bg-[var(--ep-accent)] text-[var(--ep-bg-deep)] rounded-xl hover:bg-[var(--ep-accent-hover)] transition-all duration-300 shadow-lg shadow-[var(--ep-accent-glow)] hover:shadow-xl hover:shadow-[var(--ep-accent-glow)] hover:-translate-y-0.5"
              >
                {t.nav.applyNow}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[var(--ep-bg-hover)] transition-colors"
                aria-label={t.nav.toggleMenu}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 w-72 h-full bg-[var(--ep-bg-surface)] border-l border-[var(--ep-border)] shadow-2xl shadow-black/40 ep-slide-right flex flex-col">
            <div className="p-5 border-b border-[var(--ep-border)]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold tracking-wider uppercase text-[var(--ep-text-primary)]">
                  {t.nav.menu}
                </span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-[var(--ep-bg-hover)] transition-colors"
                    aria-label={t.nav.closeMenu}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
              {navLinks.map((link, index) => {
                const isActive = link.href === "/" ? pathname === "/" || pathname === "/es" : pathname.startsWith(link.href) || pathname.startsWith(`/es${link.href}`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ep-fade-up ${
                      isActive
                        ? "bg-[var(--ep-accent-muted)] text-[var(--ep-accent)] border border-[var(--ep-border-accent)]"
                        : "text-[var(--ep-text-secondary)] hover:text-[var(--ep-text-primary)] hover:bg-[var(--ep-bg-hover)]"
                    }`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-[var(--ep-border)]">
              <Link
                href="/applys"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-bold uppercase tracking-wider bg-[var(--ep-accent)] text-[var(--ep-bg-deep)] rounded-xl hover:bg-[var(--ep-accent-hover)] transition-all duration-300"
              >
                {t.nav.applyNow}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="h-16 sm:h-18" aria-hidden="true" />
    </>
  );
}
