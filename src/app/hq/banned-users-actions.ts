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

export async function processBannedUsersChunk(
  queries: string[],
  status: string,
  reason: string | null,
  description: string | null
) {
  try {
    await requireAdminSession();

    if (!queries || queries.length === 0) {
      return { success: false, error: "No queries provided" };
    }

    const numericIds: string[] = [];
    const usernames: string[] = [];

    for (const q of queries) {
      if (/^\d+$/.test(q)) {
        numericIds.push(q);
      } else {
        usernames.push(q);
      }
    }

    const resolvedUsers: { id: string; name: string }[] = [];

    // Process usernames (usually up to 100)
    if (usernames.length > 0) {
      try {
        const res = await fetch("https://users.roblox.com/v1/usernames/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames, excludeBannedUsers: false }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            for (const u of data.data) {
              resolvedUsers.push({ id: String(u.id), name: u.name });
            }
          }
        }
      } catch (e) {
        console.error("Bulk username lookup failed for batch", e);
      }
    }

    // Process IDs (usually up to 100)
    if (numericIds.length > 0) {
      try {
        const res = await fetch("https://users.roblox.com/v1/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: numericIds.map(Number), excludeBannedUsers: false }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            for (const u of data.data) {
              resolvedUsers.push({ id: String(u.id), name: u.name });
            }
          }
        }
      } catch (e) {
        console.error("Bulk ID lookup failed for batch", e);
      }
    }

    if (resolvedUsers.length === 0) {
      return { success: true, addedCount: 0, results: [] };
    }

    // Database Bulk Operations
    const createData = resolvedUsers.map(u => ({
      robloxUserId: u.id,
      username: u.name,
      status,
      reason,
      description,
      addedBy: "admin"
    }));

    const names = createData.map(b => b.username);

    // Create any that don't exist
    await prisma.bannedUserRecord.createMany({
      data: createData,
      skipDuplicates: true,
    });

    // Update existing ones (and newly created ones) with the latest reason/status
    await prisma.bannedUserRecord.updateMany({
      where: { username: { in: names } },
      data: {
        status,
        reason,
        description,
      }
    });

    revalidatePath("/hq/banned-users");

    return { 
      success: true, 
      addedCount: createData.length, 
      results: [] 
    };
  } catch (err) {
    console.error("Chunk add error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to bulk add chunk" };
  }
}

export async function bulkAddBannedUsers(formData: FormData) {
  // This is kept for backward compatibility if needed, but the client will use processBannedUsersChunk
  return { success: false, error: "Please use the client-side chunk processor." };
}

export async function deleteAllBannedUsers() {
  await requireAdminSession();
  await prisma.bannedUserRecord.deleteMany();
  revalidatePath("/hq/banned-users");
  return { success: true };
}
