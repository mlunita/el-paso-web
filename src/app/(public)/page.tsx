import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Gamepad2, Shield, Users, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();
  const settings = await prisma.siteSettings.findFirst().catch(() => null);
  const useDynamicCopy = locale === "en";
  const title = useDynamicCopy && settings?.bannerTitle ? `${settings.bannerTitle} | El Paso RP` : t.seo.pages.home.title;
  const description = useDynamicCopy && settings?.description ? settings.description : t.seo.pages.home.description;

  return createLocalizedMetadata({
    locale,
    path: "/",
    title,
    description,
    image: settings?.bannerImage || "/logo.png",
    imageAlt: t.seo.pages.home.imageAlt,
  });
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const t = await getTranslations();
  const settings = await prisma.siteSettings.findFirst().catch(() => null);
  const useDynamicCopy = locale === "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: t.site.fullName,
    description: useDynamicCopy && settings?.description ? settings.description : t.seo.pages.home.description,
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://elpaso-rp.com",
    playMode: "MultiPlayer",
    applicationCategory: "Game",
    inLanguage: t.locale.htmlLang,
    genre: "Roleplay",
    gamePlatform: "Roblox",
  };

  const socialLinks = [
    {
      name: "Discord",
      icon: "/discord.png",
      color: "#5865F2",
      link: settings?.socialDiscord || "https://discord.gg/elpaso",
      label: t.home.social.discord,
    },
    {
      name: "Roblox",
      icon: "/roblox.png",
      color: "#393b3d",
      link: settings?.socialTwitter || "https://www.roblox.com/games/109872214376771/El-Paso-Texas-Border-Roleplay",
      label: t.home.social.roblox,
    },
    {
      name: "TikTok",
      icon: "/tiktok.png",
      color: "#ff0050",
      link: settings?.socialYoutube || "https://www.tiktok.com/@elpasotexasoficial",
      label: t.home.social.tiktok,
    },
  ];

  const features = [
    { icon: Gamepad2, title: t.home.features.immersive.title, description: t.home.features.immersive.description },
    { icon: Users, title: t.home.features.community.title, description: t.home.features.community.description },
    { icon: Shield, title: t.home.features.moderation.title, description: t.home.features.moderation.description },
    { icon: Zap, title: t.home.features.updates.title, description: t.home.features.updates.description },
  ];

  return (
    <main className="flex flex-col w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section
        aria-label={t.home.hero.aria}
        className="relative w-full min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {settings?.bannerImage ? (
          <>
            <Image
              src={settings.bannerImage}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              alt={t.home.hero.bannerAlt}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--ep-bg-deep)]/70 via-[var(--ep-bg-deep)]/40 to-[var(--ep-bg-deep)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--ep-bg-deep)] via-[var(--ep-bg-surface)] to-[var(--ep-bg-deep)]">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--ep-accent)]/[0.05] rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--ep-secondary)]/[0.03] rounded-full blur-[100px]" />
          </div>
        )}

        <div
          className="absolute inset-0 opacity-[0.02]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl mx-auto">
          <BadgePulse appsOpen={settings?.appsOpen ?? true} />

          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 uppercase tracking-tighter text-[var(--ep-text-primary)] leading-[0.9] ep-fade-up">
            {useDynamicCopy && settings?.bannerTitle ? settings.bannerTitle : t.home.hero.defaultTitle}
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl text-[var(--ep-text-secondary)] max-w-2xl text-balance leading-relaxed ep-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            {useDynamicCopy && settings?.bannerSubtitle ? settings.bannerSubtitle : t.home.hero.defaultSubtitle}
          </p>

          <nav
            className="mt-8 sm:mt-10 flex gap-3 sm:gap-4 flex-wrap justify-center ep-fade-up"
            style={{ animationDelay: "200ms" }}
            aria-label={t.nav.mainNavigation}
          >
            <Link
              href="/applys"
              className="group inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 bg-[var(--ep-accent)] text-[var(--ep-bg-deep)] rounded-xl font-bold uppercase tracking-wider hover:bg-[var(--ep-accent-hover)] transition-all duration-300 shadow-lg shadow-[var(--ep-accent-glow)] hover:shadow-xl hover:shadow-[var(--ep-accent-glow)] hover:-translate-y-0.5 text-sm sm:text-base"
            >
              {t.home.cta.joinNow}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link
              href="/news"
              className="px-7 sm:px-8 py-3.5 sm:py-4 ep-card-glass text-[var(--ep-text-primary)] rounded-xl font-bold uppercase tracking-wider hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base"
            >
              {t.home.cta.readNews}
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--ep-bg-deep)] to-transparent" aria-hidden="true" />
      </section>

      <section aria-label={t.home.overview.aria} className="ep-section">
        <div className="ep-section-inner">
          <div className="relative rounded-2xl p-8 sm:p-10 md:p-12 text-center overflow-hidden ep-card-glass">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--ep-accent)]/[0.03] to-transparent ep-shimmer pointer-events-none" aria-hidden="true" />
            <p className="relative z-10 text-lg sm:text-xl md:text-2xl font-medium text-[var(--ep-text-secondary)] leading-relaxed max-w-3xl mx-auto">
              {useDynamicCopy && settings?.description ? settings.description : t.home.overview.fallback}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="ep-section py-8 sm:py-12">
        <div className="ep-section-inner">
          <h2 id="features-heading" className="sr-only">
            {t.home.features.heading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="ep-card group p-6 sm:p-7 ep-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--ep-accent-muted)] flex items-center justify-center mb-4 group-hover:bg-[var(--ep-accent)]/20 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[var(--ep-accent)]" aria-hidden="true" />
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-[var(--ep-text-primary)] mb-2 uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--ep-text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-label={t.home.social.aria} className="ep-section py-8 sm:py-12">
        <div className="ep-section-inner">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {socialLinks.map((social, i) => (
              <Link
                href={social.link}
                key={social.name}
                target="_blank"
                rel="noopener noreferrer"
                className="group ep-card flex items-center gap-4 p-5 sm:p-6 ep-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
                aria-label={social.label}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${social.color}20` }}
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={24}
                    height={24}
                    className="object-contain invert opacity-80"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-[family-name:var(--font-heading)] text-base font-bold text-[var(--ep-text-primary)] uppercase tracking-wider group-hover:text-[var(--ep-accent)] transition-colors duration-200">
                    {social.name}
                  </span>
                  <span className="text-xs text-[var(--ep-text-muted)] tracking-wide">
                    {t.home.social.joinCommunity}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--ep-text-muted)] ml-auto group-hover:text-[var(--ep-accent)] group-hover:translate-x-1 transition-all duration-200" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-heading" className="ep-section">
        <div className="ep-section-inner">
          <div className="ep-card-elevated rounded-2xl p-8 sm:p-10 md:p-14">
            <div className="text-center mb-8 sm:mb-12">
              <h2
                id="about-heading"
                className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-[var(--ep-text-primary)] inline-block"
              >
                {t.home.about.heading}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
              <article className="space-y-4">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--ep-text-primary)] uppercase tracking-wider relative inline-block">
                  {t.home.about.col1.heading}
                  <span className="absolute -bottom-2 left-0 w-12 h-[2px] bg-[var(--ep-accent)] rounded-full" aria-hidden="true" />
                </h3>
                <p className="text-[var(--ep-text-secondary)] leading-relaxed text-sm md:text-base">
                  {t.home.about.col1.p1}
                </p>
                <p className="text-[var(--ep-text-secondary)] leading-relaxed text-sm md:text-base">
                  {t.home.about.col1.p2}
                </p>
              </article>

              <article className="space-y-4">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[var(--ep-text-primary)] uppercase tracking-wider relative inline-block">
                  {t.home.about.col2.heading}
                  <span className="absolute -bottom-2 left-0 w-12 h-[2px] bg-[var(--ep-secondary)] rounded-full" aria-hidden="true" />
                </h3>
                <p className="text-[var(--ep-text-secondary)] leading-relaxed text-sm md:text-base">
                  {t.home.about.col2.p1}
                </p>
                <p className="text-[var(--ep-text-secondary)] leading-relaxed text-sm md:text-base">
                  {t.home.about.col2.p2}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function BadgePulse({ appsOpen }: { appsOpen: boolean }) {
  const t = await getTranslations();
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 rounded-full bg-[var(--ep-bg-surface)] border border-[var(--ep-border)] text-sm font-medium text-[var(--ep-text-secondary)] ep-fade-up shadow-lg shadow-black/20">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${appsOpen ? "bg-[var(--ep-success)]" : "bg-[var(--ep-danger)]"} opacity-75`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${appsOpen ? "bg-[var(--ep-success)]" : "bg-[var(--ep-danger)]"}`}
        />
      </span>
      {appsOpen ? t.home.badge.open : t.home.badge.closed}
    </div>
  );
}
