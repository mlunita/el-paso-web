import { prisma } from "@/lib/prisma";

// =====================================================
// Roblox API Client with Caching
// =====================================================

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-memory rate limiter per performer
const lookupAttempts = new Map<string, { count: number; resetAt: number }>();
const LOOKUP_RATE_LIMIT = 30; // per window
const LOOKUP_WINDOW_MS = 60 * 1000; // 1 minute

export function checkLookupRateLimit(performerId: string): boolean {
  const now = Date.now();
  const entry = lookupAttempts.get(performerId);

  if (!entry || now > entry.resetAt) {
    lookupAttempts.set(performerId, { count: 1, resetAt: now + LOOKUP_WINDOW_MS });
    return true;
  }

  if (entry.count >= LOOKUP_RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export interface RobloxUserData {
  userId: string;
  username: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  accountCreated: Date | null;
  isBanned: boolean;
}

/**
 * Resolve a Roblox user by username or userId.
 * Uses DB cache with 1-hour TTL before hitting the Roblox API.
 */
export async function lookupRobloxUser(query: string): Promise<RobloxUserData | null> {
  const isNumeric = /^\d+$/.test(query.trim());

  // Check cache first
  const cached = isNumeric
    ? await prisma.robloxUserCache.findUnique({ where: { robloxUserId: query.trim() } })
    : await prisma.robloxUserCache.findFirst({ where: { username: { equals: query.trim(), mode: "insensitive" } } });

  if (cached && Date.now() - cached.lastFetched.getTime() < CACHE_TTL_MS) {
    return {
      userId: cached.robloxUserId,
      username: cached.username,
      displayName: cached.displayName,
      description: cached.description,
      avatarUrl: cached.avatarUrl,
      accountCreated: cached.accountCreated,
      isBanned: cached.isBanned,
    };
  }

  // Resolve userId from username if needed
  let userId: string | null = isNumeric ? query.trim() : null;

  if (!userId) {
    try {
      const res = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [query.trim()], excludeBannedUsers: false }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          userId = String(data.data[0].id);
        }
      }
    } catch {
      // API failure — return cached if available
      if (cached) {
        return {
          userId: cached.robloxUserId,
          username: cached.username,
          displayName: cached.displayName,
          description: cached.description,
          avatarUrl: cached.avatarUrl,
          accountCreated: cached.accountCreated,
          isBanned: cached.isBanned,
        };
      }
      return null;
    }
  }

  if (!userId) return null;

  // Fetch user details
  try {
    const [userRes, avatarRes] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${userId}`, {
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`, {
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    if (!userRes.ok) {
      if (cached) {
        return {
          userId: cached.robloxUserId,
          username: cached.username,
          displayName: cached.displayName,
          description: cached.description,
          avatarUrl: cached.avatarUrl,
          accountCreated: cached.accountCreated,
          isBanned: cached.isBanned,
        };
      }
      return null;
    }

    const userData = await userRes.json();
    let avatarUrl: string | null = null;

    if (avatarRes.ok) {
      const avatarData = await avatarRes.json();
      if (avatarData.data && avatarData.data.length > 0) {
        avatarUrl = avatarData.data[0].imageUrl || null;
      }
    }

    const result: RobloxUserData = {
      userId: String(userData.id),
      username: userData.name || "",
      displayName: userData.displayName || null,
      description: userData.description || null,
      avatarUrl,
      accountCreated: userData.created ? new Date(userData.created) : null,
      isBanned: userData.isBanned || false,
    };

    // Upsert cache
    await prisma.robloxUserCache.upsert({
      where: { robloxUserId: result.userId },
      update: {
        username: result.username,
        displayName: result.displayName,
        description: result.description,
        avatarUrl: result.avatarUrl,
        accountCreated: result.accountCreated,
        isBanned: result.isBanned,
        lastFetched: new Date(),
        rawData: JSON.stringify(userData),
      },
      create: {
        robloxUserId: result.userId,
        username: result.username,
        displayName: result.displayName,
        description: result.description,
        avatarUrl: result.avatarUrl,
        accountCreated: result.accountCreated,
        isBanned: result.isBanned,
        lastFetched: new Date(),
        rawData: JSON.stringify(userData),
      },
    });

    return result;
  } catch {
    if (cached) {
      return {
        userId: cached.robloxUserId,
        username: cached.username,
        displayName: cached.displayName,
        description: cached.description,
        avatarUrl: cached.avatarUrl,
        accountCreated: cached.accountCreated,
        isBanned: cached.isBanned,
      };
    }
    return null;
  }
}

/**
 * Get internal platform data for a Roblox user by their userId.
 * This aggregates applications, ban requests, mod actions, and lookup history.
 */
export async function getInternalUserData(robloxUserId: string) {
  const [applications, banRequests, modActions, lookupLogs] = await Promise.all([
    prisma.application.findMany({
      where: { roblox: { contains: robloxUserId } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.banRequest.findMany({
      where: { targetUserId: robloxUserId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        _count: { select: { evidence: true } },
      },
    }),
    prisma.modAction.findMany({
      where: {
        targetUser: { contains: robloxUserId },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.robloxLookupLog.findMany({
      where: { resultUserId: robloxUserId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return { applications, banRequests, modActions, lookupLogs };
}
