"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBlacklist() {
  const users = await prisma.blacklistEntry.findMany({
    include: {
      nameHistory: true,
      communities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function addBlacklistUser(data: any) {
  const admin = await requireAdminSession();
  
  const created = await prisma.blacklistEntry.create({
    data: {
      discordUsername: data.discord.username || null,
      discordUserId: data.discord.userId || null,
      discordAvatarUrl: data.discord.avatarUrl || null,
      
      robloxUsername: data.roblox.username || null,
      robloxDisplayName: data.roblox.displayName || null,
      robloxUserId: data.roblox.userId || null,
      robloxAvatarUrl: data.roblox.avatarUrl || null,

      severity: data.moderation.severity,
      tags: data.moderation.tags,
      reasons: data.moderation.reasons,
      evidence: data.moderation.evidence,
      declarationPdf: data.moderation.declarationPdf || null,

      addedBy: admin.name || "admin",

      nameHistory: {
        create: [
          ...(data.discord.nameHistory || []).map((h: any) => ({
            platform: "DISCORD",
            name: h.name,
            detectedAt: new Date(h.detectedAt),
          })),
          ...(data.roblox.nameHistory || []).map((h: any) => ({
            platform: "ROBLOX",
            name: h.name,
            detectedAt: new Date(h.detectedAt),
          })),
        ]
      },

      communities: {
        create: (data.moderation.communities || []).map((c: any) => ({
          name: c.name,
          bannedAt: new Date(c.date),
        }))
      }
    }
  });

  revalidatePath("/hq/blacklist");
  revalidatePath("/blacklist");
  
  return { success: true, id: created.id };
}

export async function updateBlacklistUser(id: string, data: any) {
  await requireAdminSession();
  
  // First, clear out old relations to avoid complex updates
  await prisma.blacklistNameHistory.deleteMany({ where: { blacklistId: id } });
  await prisma.blacklistCommunityBan.deleteMany({ where: { blacklistId: id } });

  const updated = await prisma.blacklistEntry.update({
    where: { id },
    data: {
      discordUsername: data.discord.username || null,
      discordUserId: data.discord.userId || null,
      discordAvatarUrl: data.discord.avatarUrl || null,
      
      robloxUsername: data.roblox.username || null,
      robloxDisplayName: data.roblox.displayName || null,
      robloxUserId: data.roblox.userId || null,
      robloxAvatarUrl: data.roblox.avatarUrl || null,

      severity: data.moderation.severity,
      tags: data.moderation.tags,
      reasons: data.moderation.reasons,
      evidence: data.moderation.evidence,
      declarationPdf: data.moderation.declarationPdf || null,

      nameHistory: {
        create: [
          ...(data.discord.nameHistory || []).map((h: any) => ({
            platform: "DISCORD",
            name: h.name,
            detectedAt: new Date(h.detectedAt),
          })),
          ...(data.roblox.nameHistory || []).map((h: any) => ({
            platform: "ROBLOX",
            name: h.name,
            detectedAt: new Date(h.detectedAt),
          })),
        ]
      },

      communities: {
        create: (data.moderation.communities || []).map((c: any) => ({
          name: c.name,
          bannedAt: new Date(c.date),
        }))
      }
    }
  });

  revalidatePath("/hq/blacklist");
  revalidatePath("/blacklist");

  return { success: true, id: updated.id };
}

export async function deleteBlacklistUser(id: string) {
  await requireAdminSession();
  
  await prisma.blacklistEntry.delete({
    where: { id }
  });

  revalidatePath("/hq/blacklist");
  revalidatePath("/blacklist");
  
  return { success: true };
}

export async function fetchDiscordUser(id: string) {
  await requireAdminSession();
  try {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return null;

    const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();

    let avatarUrl: string | null = null;
    if (data.avatar) {
      const ext = data.avatar.startsWith("a_") ? "gif" : "png";
      avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.${ext}?size=256`;
    }

    return {
      username: data.username || null,
      displayName: data.global_name || null,
      avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function fetchRobloxUser(id: string) {
  await requireAdminSession();
  // Reuse our existing roblox lookup which has cache and resolves usernames/ids
  const { lookupRobloxUser } = await import("@/lib/roblox");
  const data = await lookupRobloxUser(id);
  return data;
}
