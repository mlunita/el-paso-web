import { NextResponse } from "next/server";

interface CachedUser {
  data: DiscordUserResponse;
  expiresAt: number;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
  banner_color: string | null;
  accent_color: number | null;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CachedUser>();

// Clean expired entries periodically
function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt < now) cache.delete(key);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate Discord snowflake (17-20 digits)
  if (!/^\d{17,20}$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid Discord ID format" },
      { status: 400 }
    );
  }

  // Check cache
  const cached = cache.get(id);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ user: cached.data }, {
      headers: { "Cache-Control": "public, max-age=600" },
    });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { error: "Discord bot token not configured", user: null },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After") || "60";
        return NextResponse.json(
          { error: "Rate limited", user: null },
          { status: 429, headers: { "Retry-After": retryAfter } }
        );
      }

      return NextResponse.json(
        { error: `Discord API error: ${res.status}`, user: null },
        { status: res.status }
      );
    }

    const data: DiscordUserResponse = await res.json();

    // Cache the result
    cache.set(id, { data, expiresAt: Date.now() + CACHE_TTL_MS });

    // Prune occasionally
    if (cache.size > 100) pruneCache();

    return NextResponse.json(
      { user: data },
      { headers: { "Cache-Control": "public, max-age=600" } }
    );
  } catch (err) {
    console.error("Discord API fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch Discord profile", user: null },
      { status: 500 }
    );
  }
}
