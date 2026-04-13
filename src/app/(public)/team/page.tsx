import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { TeamSections } from "./team-sections";

export const dynamic = "force-dynamic";

export default async function OurTeamPage() {
  let staff: any[] = [];

  try {
    staff = await prisma.staffMember.findMany({
      orderBy: { order: "asc" },
    });
  } catch (e) {
    // ignore
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-12 w-full">
      {/* Header */}
      <div className="text-center mb-2 animate-fade-in-up">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="p-3 rounded-2xl bg-[#a67c52]/10 border border-[#a67c52]/20">
            <Users className="w-8 h-8 text-[#a67c52]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#a67c52] via-[#c9a87c] to-[#a67c52]">
            Our Team
          </h1>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#a67c52] to-transparent rounded-full" />
        </div>
        <p className="text-zinc-500 text-lg mt-3 max-w-xl mx-auto">
          The dedicated people keeping El Paso RP safe. Meet the faces behind the community.
        </p>
      </div>

      <TeamSections staff={staff} />
    </div>
  );
}
