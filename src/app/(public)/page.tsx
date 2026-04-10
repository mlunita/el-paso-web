import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let settings = null;
  try {
    settings = await prisma.siteSettings.findFirst();
  } catch (e) {
    // ignore
  }

  // Define social icons mapped to the new provided images
  const SocialLinks = [
    { name: "Discord", icon: <img src="/discord.png" alt="Discord" className="w-14 h-14 object-contain filter invert" />, color: "from-indigo-600 to-blue-500", glow: "rgba(99, 102, 241, 0.4)", link: settings?.socialDiscord || "https://discord.gg/elpaso" },
    { name: "Roblox", icon: <img src="/roblox.png" alt="Roblox" className="w-14 h-14 object-contain filter invert" />, color: "from-zinc-700 to-zinc-900", glow: "rgba(39, 39, 42, 0.4)", link: settings?.socialTwitter || "https://www.roblox.com/es/games/109872214376771/El-Paso-Texas-Border-Roleplay" },
    { name: "TikTok", icon: <img src="/tiktok.png" alt="TikTok" className="w-12 h-12 object-contain filter invert" />, color: "from-rose-500 to-pink-600", glow: "rgba(244, 63, 94, 0.4)", link: settings?.socialYoutube || "https://www.tiktok.com/@elpasotexasoficial" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* HERO SECTION */}
      <div className="relative w-full rounded-3xl min-h-[350px] md:min-h-[450px] flex items-center justify-center flex-col shadow-2xl overflow-hidden group border border-white/10 border-b-violet-500/30">
        {/* Background Layer */}
        {settings?.bannerImage ? (
          <>
            <img src={settings.bannerImage} className="absolute inset-0 w-full h-full object-cover z-0" alt="Home Banner" />
            <div className="absolute inset-0 bg-black/60 z-0 backdrop-blur-[2px]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-zinc-900/80 to-indigo-950/60 animate-gradient-shift z-0" />
        )}
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none group-hover:bg-violet-500/20 transition-all duration-1000 z-0" />
        {/* Secondary orb */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col items-center p-8 text-center">
          <BadgePulse appsOpen={settings?.appsOpen ?? true} />
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 drop-shadow-sm leading-[0.9]">
            {settings?.bannerTitle || "WELCOME TO EL PASO"}
          </h1>
          <p className="text-lg md:text-xl font-medium text-zinc-400 max-w-2xl text-balance leading-relaxed">
            {settings?.bannerSubtitle || "Your definitive gaming community experience."}
          </p>
          <div className="mt-10 flex gap-4 flex-wrap justify-center">
            <Link href="/applys" className="group/btn relative px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-wider hover:bg-zinc-100 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-0.5">
              <span className="relative z-10">Join Now</span>
            </Link>
            <Link href="/news" className="px-8 py-4 glass-card text-white rounded-full font-bold uppercase tracking-wider hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10">
              Read News
            </Link>
          </div>
        </div>
      </div>

      {/* SHORT DESC SECTION */}
      <div className="w-full bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-violet-600/10 backdrop-blur-sm border border-violet-500/15 rounded-[2rem] p-8 text-center text-lg md:text-xl font-medium text-violet-100/90 shadow-inner relative overflow-hidden">
        {/* Subtle shimmer accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent animate-shimmer pointer-events-none" />
        <p className="relative z-10">
          {settings?.description || "Join thousands of players connecting daily on our platform. Find groups, enter tournaments, and level up together."}
        </p>
      </div>

      {/* SOCIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mt-2">
        {SocialLinks.map((social, i) => (
          <Link
            href={social.link}
            key={social.name}
            className={`group block relative rounded-3xl p-[1px] bg-gradient-to-br ${social.color} opacity-85 hover:opacity-100 hover:-translate-y-2 transition-all duration-400`}
            style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: `radial-gradient(circle, ${social.glow}, transparent 70%)` }} />
            <Card className="h-full bg-zinc-950/85 backdrop-blur-md border-0 text-white rounded-[1.4rem] p-8 flex flex-col items-center justify-center gap-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent z-0" />
              <div className="text-5xl z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-md animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                {social.icon}
              </div>
              <span className="text-lg font-bold uppercase tracking-[0.2em] z-10 text-zinc-300 group-hover:text-white transition-colors duration-300">{social.name}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BadgePulse({ appsOpen }: { appsOpen: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-8 rounded-full glass-card text-sm font-medium text-zinc-300 animate-fade-in-up">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${appsOpen ? "bg-emerald-400" : "bg-red-400"} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${appsOpen ? "bg-emerald-500" : "bg-red-500"}`}></span>
      </span>
      {appsOpen ? "Accepting Applications" : "Applications Closed"}
    </div>
  );
}
