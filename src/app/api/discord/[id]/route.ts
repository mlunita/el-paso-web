import { NextRequest, NextResponse } from "next/server";
import type { DiscordApiUser } from "@/lib/discord-profile";

interface CachedUser {
  data: DiscordApiUser;
  expiresAt: number;
}

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60 * 1000;
const PROFILE_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
};
const PROFILE_REFRESH_HEADERS = {
  "Cache-Control": "no-store",
};
const cache = new Map<string, CachedUser>();

// Clean expired entries periodically
function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt < now) cache.delete(key);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

  // Validate Discord snowflake (17-20 digits)
  if (!/^\d{17,20}$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid Discord ID format" },
      { status: 400 }
    );
  }

  // Check cache
  const cached = cache.get(id);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ user: cached.data }, {
      headers: PROFILE_CACHE_HEADERS,
    });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { error: "Discord bot token not configured", user: null },
      { status: 503, headers: PROFILE_REFRESH_HEADERS }
    );
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "User-Agent": "ElPasoRPWebsite (https://elpaso-rp.com, 1.0)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After") || "60";
        return NextResponse.json(
          { error: "Rate limited", user: null },
          { status: 429, headers: { ...PROFILE_REFRESH_HEADERS, "Retry-After": retryAfter } }
        );
      }

      return NextResponse.json(
        { error: `Discord API error: ${res.status}`, user: null },
        { status: res.status, headers: PROFILE_REFRESH_HEADERS }
      );
    }

    const data: DiscordApiUser = await res.json();

    // Cache the result
    cache.set(id, { data, expiresAt: Date.now() + CACHE_TTL_MS });

    // Prune occasionally
    if (cache.size > 100) pruneCache();

    return NextResponse.json(
      { user: data },
      { headers: forceRefresh ? PROFILE_REFRESH_HEADERS : PROFILE_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("Discord API fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch Discord profile", user: null },
      { status: 500, headers: PROFILE_REFRESH_HEADERS }
    );
  }
}
