const DISCORD_MEDIA_HOSTNAMES = new Set([
  "cdn.discordapp.com",
  "media.discordapp.net",
]);

function parseDiscordExpiry(value: string | null): number | null {
  if (!value || !/^[0-9a-f]+$/i.test(value)) {
    return null;
  }

  const seconds = Number.parseInt(value, 16);
  if (!Number.isFinite(seconds)) {
    return null;
  }

  return seconds * 1000;
}

export interface WikiImageInspection {
  normalizedUrl: string | null;
  issue: string | null;
  isVolatile: boolean;
  isExpired: boolean;
  expiresAt: number | null;
}

export function inspectWikiImageUrl(
  raw: string | null | undefined,
  now = Date.now(),
): WikiImageInspection {
  const normalizedUrl = raw?.trim() || null;

  if (!normalizedUrl) {
    return {
      normalizedUrl: null,
      issue: null,
      isVolatile: false,
      isExpired: false,
      expiresAt: null,
    };
  }

  if (normalizedUrl.startsWith("/")) {
    return {
      normalizedUrl,
      issue: null,
      isVolatile: false,
      isExpired: false,
      expiresAt: null,
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return {
      normalizedUrl,
      issue: "Enter a valid image URL or a site-relative path.",
      isVolatile: false,
      isExpired: false,
      expiresAt: null,
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      normalizedUrl,
      issue: "Image URLs must start with http://, https://, or /.",
      isVolatile: false,
      isExpired: false,
      expiresAt: null,
    };
  }

  const isDiscordMediaUrl = DISCORD_MEDIA_HOSTNAMES.has(parsedUrl.hostname);
  const expiresAt = parseDiscordExpiry(parsedUrl.searchParams.get("ex"));
  const hasDiscordSignature =
    parsedUrl.searchParams.has("ex") ||
    parsedUrl.searchParams.has("is") ||
    parsedUrl.searchParams.has("hm");

  if (isDiscordMediaUrl && hasDiscordSignature) {
    const isExpired = expiresAt !== null && expiresAt <= now;

    return {
      normalizedUrl,
      issue: isExpired
        ? "This Discord media link has already expired. Use a permanent direct image URL instead."
        : "Discord media/share links with security tokens expire and are not reliable for production. Use a permanent direct image URL instead.",
      isVolatile: true,
      isExpired,
      expiresAt,
    };
  }

  return {
    normalizedUrl,
    issue: null,
    isVolatile: false,
    isExpired: false,
    expiresAt,
  };
}
