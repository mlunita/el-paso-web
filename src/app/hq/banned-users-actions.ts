"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { lookupRobloxUser } from "@/lib/roblox";

// =====================================================
// Public Database Actions
// =====================================================

export async function searchBannedUser(query: string) {
  if (!query || query.trim() === "") return null;
  const normalizedQuery = query.trim();
  const isNumeric = /^\d+$/.test(normalizedQuery);

  // 1. Resolve Roblox info
  const robloxUser = await lookupRobloxUser(normalizedQuery);

  if (!robloxUser) {
    return { found: false, error: "User not found on Roblox" };
  }

  // 2. Search our database
  const record = await prisma.bannedUserRecord.findFirst({
    where: {
      OR: [
        { robloxUserId: robloxUser.userId },
        { username: { equals: robloxUser.username, mode: "insensitive" } },
      ],
    },
  });

  return {
    found: true,
    roblox: {
      userId: robloxUser.userId,
      username: robloxUser.username,
      displayName: robloxUser.displayName,
      description: robloxUser.description,
      avatarUrl: robloxUser.avatarUrl,
      accountCreated: robloxUser.accountCreated ? robloxUser.accountCreated.toISOString() : null,
      isBannedOnRoblox: robloxUser.isBanned,
    },
    record: record ? {
      status: record.status,
      reason: record.reason,
      description: record.description,
      createdAt: record.createdAt.toISOString(),
    } : null,
  };
}

// =====================================================
// Admin Database Actions
// =====================================================

export async function getBannedUsers(page = 1, pageSize = 50) {
  await requireAdminSession();

  const [users, total] = await Promise.all([
    prisma.bannedUserRecord.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.bannedUserRecord.count(),
  ]);

  return { users, total };
}

export async function removeBannedUser(id: string) {
  await requireAdminSession();
  
  await prisma.bannedUserRecord.delete({ where: { id } });
  
  revalidatePath("/hq/banned-users");
}

export async function bulkAddBannedUsers(formData: FormData) {
  try {
    await requireAdminSession();

    const rawInput = formData.get("users") as string;
    const status = (formData.get("status") as string) || "BANNED";
    const reason = (formData.get("reason") as string) || null;
    const description = (formData.get("description") as string) || null;

    if (!rawInput || rawInput.trim() === "") {
      return { success: false, error: "No users provided" };
    }

    const queries = rawInput
      .split(/[\n,]+/)
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (queries.length === 0) {
      return { success: false, error: "No valid users found in input" };
    }

    const results = [];
    let addedCount = 0;

    for (const query of queries) {
      try {
        const robloxUser = await lookupRobloxUser(query);
        
        if (!robloxUser) {
          results.push({ query, success: false, error: "Not found on Roblox" });
          continue;
        }

        // Upsert record
        await prisma.bannedUserRecord.upsert({
          where: { username: robloxUser.username },
          update: {
            robloxUserId: robloxUser.userId,
            status,
            reason,
            description,
          },
          create: {
            robloxUserId: robloxUser.userId,
            username: robloxUser.username,
            status,
            reason,
            description,
            addedBy: "admin",
          },
        });

        results.push({ query, success: true, username: robloxUser.username });
        addedCount++;
      } catch (err) {
        results.push({ query, success: false, error: "Error processing" });
      }
    }

    revalidatePath("/hq/banned-users");
    return { success: true, addedCount, results };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to bulk add" };
  }
}
