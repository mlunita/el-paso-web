import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getTranslations } from "@/lib/i18n/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  const navigationLinks = [
    { href: "/", label: t.nav.home },
    { href: "/news", label: t.nav.news },
    { href: "/wiki", label: t.nav.wiki },
    { href: "/team", label: t.nav.team },
  ];

  const communityLinks = [
    { href: "/applys", label: t.footer.applyNow },
    { href: "/status", label: t.footer.applicationStatus },
    { href: "/ticket-status", label: t.footer.ticketStatus },
    { href: "/support", label: t.footer.supportArchive },
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">{children}</main>

      <footer className="relative mt-24 border-t border-[var(--ep-border)]">
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--ep-accent)]/20 to-transparent"
          aria-hidden="true"
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 shrink-0">
                  <Image src="/logo.png" alt={t.site.logoAlt} fill className="object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-[family-name:var(--font-heading)] text-sm font-bold tracking-wider uppercase text-[var(--ep-text-primary)]">
                    {t.site.name}
                  </span>
                  <span className="text-[10px] font-medium tracking-widest uppercase text-[var(--ep-text-muted)]">
                    {t.site.tagline}
                  </span>
                </div>
              </div>
              <p className="text-[var(--ep-text-secondary)] text-sm leading-relaxed max-w-xs">
                {t.site.description}
              </p>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-text-muted)] mb-4">
                {t.footer.navigate}
              </h3>
              <ul className="flex flex-col gap-2">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--ep-text-secondary)] hover:text-[var(--ep-accent)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-text-muted)] mb-4">
                {t.footer.community}
              </h3>
              <ul className="flex flex-col gap-2">
                {communityLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--ep-text-secondary)] hover:text-[var(--ep-accent)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ep-text-muted)] mb-4">
                {t.footer.connect}
              </h3>
              <div className="flex gap-3">
                <a
                  href="https://discord.gg/elpaso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[var(--ep-bg-elevated)] border border-[var(--ep-border)] flex items-center justify-center hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)] transition-all duration-200"
                >
                  <Image src="/discord.png" alt="Discord" width={18} height={18} className="invert opacity-60" unoptimized />
                </a>
                <a
                  href="https://www.roblox.com/es/games/109872214376771/El-Paso-Texas-Border-Roleplay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[var(--ep-bg-elevated)] border border-[var(--ep-border)] flex items-center justify-center hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)] transition-all duration-200"
                >
                  <Image src="/roblox.png" alt="Roblox" width={18} height={18} className="invert opacity-60" unoptimized />
                </a>
                <a
                  href="https://www.tiktok.com/@elpasotexasoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[var(--ep-bg-elevated)] border border-[var(--ep-border)] flex items-center justify-center hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)] transition-all duration-200"
                >
                  <Image src="/tiktok.png" alt="TikTok" width={18} height={18} className="invert opacity-60" unoptimized />
                </a>
              </div>
            </div>

            <LanguageSwitcher />
          </div>

          <div className="mt-12 pt-6 border-t border-[var(--ep-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[var(--ep-text-muted)] text-xs tracking-wider uppercase">
              {t.footer.copyright(year)}
            </span>
            <Link
              href="/support"
              className="text-[var(--ep-text-muted)] text-xs tracking-wider uppercase hover:text-[var(--ep-accent)] transition-colors duration-200"
            >
              {t.footer.supportArchive}
            </Link>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="text-[var(--ep-text-muted)] text-[11px] tracking-[0.2em] uppercase font-medium">
              Created by
            </span>
            <a
              href="https://alamostudios.com.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-[180px] h-[50px] block opacity-70 hover:opacity-100 transition-opacity duration-300"
            >
              <Image
                src="/creator-logo.png"
                alt="Alamo Studios"
                fill
                className="object-contain"
                sizes="180px"
                unoptimized
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
