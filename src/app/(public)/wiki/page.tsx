import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";
import { WikiSections } from "./wiki-sections";

export const dynamic = "force-dynamic";

export default async function WikiPage() {
  let items: any[] = [];
  try {
    items = await prisma.wikiItem.findMany({
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });
  } catch (e) {
    // ignore
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

      <WikiSections items={items} />

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
