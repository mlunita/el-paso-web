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

    const queries = Array.from(new Set(
      rawInput
        .split(/[\n,]+/)
        .map((q) => q.trim())
        .filter((q) => q.length > 0)
    ));

    if (queries.length === 0) {
      return { success: false, error: "No valid users found in input" };
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

    // Process usernames in batches of 100
    for (let i = 0; i < usernames.length; i += 100) {
      const batch = usernames.slice(i, i + 100);
      try {
        const res = await fetch("https://users.roblox.com/v1/usernames/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames: batch, excludeBannedUsers: false }),
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

    // Process IDs in batches of 100
    for (let i = 0; i < numericIds.length; i += 100) {
      const batch = numericIds.slice(i, i + 100);
      try {
        const res = await fetch("https://users.roblox.com/v1/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: batch.map(Number), excludeBannedUsers: false }),
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
      return { success: false, error: "Could not resolve any users from Roblox API." };
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

    let addedCount = 0;
    
    // Chunk database operations into 1000 rows to prevent query size limits
    for (let i = 0; i < createData.length; i += 1000) {
      const batch = createData.slice(i, i + 1000);
      const names = batch.map(b => b.username);

      // Create any that don't exist
      await prisma.bannedUserRecord.createMany({
        data: batch,
        skipDuplicates: true,
      });

      // Update existing ones (and newly created ones) with the latest reason/status
      await prisma.bannedUserRecord.updateMany({
        where: { username: { in: names } },
        data: {
          robloxUserId: { set: batch[0].robloxUserId }, // Safe fallback, though mostly useful for status
          status,
          reason,
          description,
        }
      });
      
      addedCount += batch.length;
    }

    revalidatePath("/hq/banned-users");
    
    const results = [{ 
      query: `Successfully resolved and processed ${addedCount} users out of ${queries.length} input values.`, 
      success: true 
    }];

    return { success: true, addedCount, results };
  } catch (err) {
    console.error("Bulk add error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to bulk add" };
  }
}
