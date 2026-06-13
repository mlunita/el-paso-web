import { prisma } from "@/lib/prisma";
import { BlacklistManagerClient } from "./blacklist-manager-client";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminBlacklistPage() {
  await requireAdminSession();

  const users = await prisma.blacklistEntry.findMany({
    include: {
      nameHistory: true,
      communities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const mappedUsers = users.map((u) => {
    const discordHistory = u.nameHistory
      .filter((h) => h.platform === "DISCORD")
      .map((h) => ({ name: h.name, detectedAt: h.detectedAt.toISOString() }));
    
    const robloxHistory = u.nameHistory
      .filter((h) => h.platform === "ROBLOX")
      .map((h) => ({ name: h.name, detectedAt: h.detectedAt.toISOString() }));

    const communities = u.communities.map((c) => ({
      name: c.name,
      date: c.bannedAt.toISOString(),
    }));

    return {
      id: u.id,
      discord: {
        username: u.discordUsername || "",
        userId: u.discordUserId || "",
        avatarUrl: u.discordAvatarUrl || "",
        nameHistory: discordHistory,
      },
      roblox: {
        username: u.robloxUsername || "",
        displayName: u.robloxDisplayName || "",
        userId: u.robloxUserId || "",
        avatarUrl: u.robloxAvatarUrl || "",
        nameHistory: robloxHistory,
      },
      moderation: {
        addedAt: u.createdAt.toISOString(),
        severity: u.severity,
        tags: u.tags,
        reasons: u.reasons,
        communities: communities,
        evidence: u.evidence,
      },
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Blacklist Manager
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage the global blacklist of banned users across Discord and Roblox.
          </p>
        </div>
      </div>
      
      <div className="bg-[#0f0f12] rounded-xl border border-white/5 overflow-hidden">
        <BlacklistManagerClient initialUsers={mappedUsers} />
      </div>
    </div>
  );
}
