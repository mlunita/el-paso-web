import type { Metadata } from "next";
import { BlacklistClient } from "./blacklist-client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blacklist Manager - El Paso RP",
  description:
    "Public blacklist of banned users across Discord and Roblox communities. View moderation records, ban history, and name change tracking.",
};

export default async function BlacklistPage() {
  const users = await prisma.blacklistEntry.findMany({
    include: {
      nameHistory: true,
      communities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map db models to the shape expected by the UI
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

  return <BlacklistClient initialUsers={mappedUsers as any} readOnly={true} />;
}
