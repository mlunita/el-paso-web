import { prisma } from "@/lib/prisma";
import { Swords, ShieldCheck, Car, Sparkles, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

const SECTION_CONFIG: Record<string, { label: string; icon: any; gradient: string; glow: string }> = {
  GAMEPASS: {
    label: "Gamepass",
    icon: Sparkles,
    gradient: "from-amber-500/20 to-orange-500/10",
    glow: "bg-amber-500/10",
  },
  WEAPONS: {
    label: "Weapons",
    icon: Swords,
    gradient: "from-red-500/20 to-rose-500/10",
    glow: "bg-red-500/10",
  },
  EQUIPMENT: {
    label: "Equipment",
    icon: ShieldCheck,
    gradient: "from-blue-500/20 to-cyan-500/10",
    glow: "bg-blue-500/10",
  },
  CARS: {
    label: "Cars",
    icon: Car,
    gradient: "from-emerald-500/20 to-green-500/10",
    glow: "bg-emerald-500/10",
  },
};

const SECTION_ORDER = ["GAMEPASS", "WEAPONS", "EQUIPMENT", "CARS"];

export default async function WikiPage() {
  let items: any[] = [];
  try {
    items = await prisma.wikiItem.findMany({
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });
  } catch (e) {
    // ignore
  }

  const grouped: Record<string, any[]> = {};
  for (const section of SECTION_ORDER) {
    grouped[section] = items.filter((i) => i.section === section);
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="flex flex-col mb-2 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-[#a67c52]/10 border border-[#a67c52]/20">
            <BookOpen className="w-8 h-8 text-[#a67c52]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#a67c52] via-[#c9a87c] to-[#a67c52]">
            Wiki
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-12 bg-gradient-to-r from-[#a67c52] to-transparent rounded-full" />
          <p className="text-zinc-500 text-lg">Everything you need to know about El Paso RP items.</p>
        </div>
      </div>

      {SECTION_ORDER.map((sectionKey, sIndex) => {
        const config = SECTION_CONFIG[sectionKey];
        const sectionItems = grouped[sectionKey];
        const Icon = config.icon;

        return (
          <section
            key={sectionKey}
            className="animate-fade-in-up"
            style={{ animationDelay: `${sIndex * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl ${config.glow} border border-white/5`}>
                <Icon className="w-5 h-5 text-zinc-300" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                {config.label}
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            {sectionItems.length === 0 ? (
              <div className="glass-card border-dashed rounded-2xl p-8 text-center">
                <span className="text-zinc-600 font-medium">No items in this section yet.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group glass-card rounded-2xl overflow-hidden hover:border-[#a67c52]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#a67c52]/5 animate-fade-in-up flex flex-col"
                    style={{ animationDelay: `${(sIndex * 100) + (index * 60)}ms` }}
                  >
                    {item.image && (
                      <div className="w-full h-40 relative overflow-hidden bg-zinc-900 border-b border-white/5 shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-zinc-500 text-sm leading-relaxed flex-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {items.length === 0 && (
        <div className="w-full min-h-[300px] glass-card border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-500 gap-5 animate-fade-in-up">
          <div className="relative">
            <BookOpen className="w-16 h-16 text-zinc-700 animate-float" />
            <div className="absolute inset-0 bg-[#a67c52]/10 blur-2xl rounded-full" />
          </div>
          <span className="text-xl font-medium uppercase tracking-widest">Wiki Coming Soon</span>
          <p className="text-zinc-600 text-sm">Content is being added by the admins.</p>
        </div>
      )}
    </div>
  );
}
