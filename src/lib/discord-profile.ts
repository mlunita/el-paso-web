export interface DiscordAvatarDecorationData {
  asset: string;
  sku_id?: string;
}

export interface DiscordPrimaryGuild {
  identity_guild_id?: string | null;
  identity_enabled?: boolean | null;
  tag?: string | null;
  badge?: string | null;
}

export interface DiscordApiUser {
  id: string;
  username: string;
  discriminator?: string | null;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  banner_color?: string | null;
  accent_color?: number | null;
  public_flags?: number | null;
  flags?: number | null;
  premium_type?: number | null;
  avatar_decoration_data?: DiscordAvatarDecorationData | null;
  primary_guild?: DiscordPrimaryGuild | null;
}

export interface DiscordProfileBadge {
  key: string;
  label: string;
  tone: "brand" | "gold" | "cyan" | "green" | "red" | "violet";
}

export const DISCORD_PROFILE_REFRESH_MS = 60 * 1000;

const DISCORD_CDN_BASE_URL = "https://cdn.discordapp.com";

const PUBLIC_FLAG_BADGES: Array<{
  bit: number;
  key: string;
  label: string;
  tone: DiscordProfileBadge["tone"];
}> = [
  { bit: 1 << 0, key: "staff", label: "Discord Staff", tone: "brand" },
  { bit: 1 << 1, key: "partner", label: "Partner", tone: "cyan" },
  { bit: 1 << 2, key: "hypesquad", label: "HypeSquad Events", tone: "violet" },
  { bit: 1 << 3, key: "bugHunter1", label: "Bug Hunter", tone: "green" },
  { bit: 1 << 6, key: "bravery", label: "House Bravery", tone: "red" },
  { bit: 1 << 7, key: "brilliance", label: "House Brilliance", tone: "cyan" },
  { bit: 1 << 8, key: "balance", label: "House Balance", tone: "violet" },
  { bit: 1 << 9, key: "earlySupporter", label: "Early Supporter", tone: "gold" },
  { bit: 1 << 14, key: "bugHunter2", label: "Bug Hunter Gold", tone: "gold" },
  { bit: 1 << 16, key: "verifiedBot", label: "Verified Bot", tone: "brand" },
  { bit: 1 << 17, key: "verifiedDeveloper", label: "Verified Developer", tone: "brand" },
  { bit: 1 << 18, key: "moderatorAlumni", label: "Moderator Alumni", tone: "green" },
  { bit: 1 << 19, key: "httpInteractions", label: "HTTP Interactions", tone: "brand" },
];

export function buildDiscordAvatarUrl(userId: string, avatarHash: string, size = 256): string {
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `${DISCORD_CDN_BASE_URL}/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
}

export function buildDiscordBannerUrl(userId: string, bannerHash: string, size = 600): string {
  const ext = bannerHash.startsWith("a_") ? "gif" : "png";
  return `${DISCORD_CDN_BASE_URL}/banners/${userId}/${bannerHash}.${ext}?size=${size}`;
}

export function buildDiscordDefaultAvatarUrl(userId: string, discriminator?: string | null): string {
  const legacyDiscriminator = discriminator && discriminator !== "0" ? Number(discriminator) : null;
  const index = Number.isInteger(legacyDiscriminator)
    ? Number(legacyDiscriminator) % 5
    : getSnowflakeDefaultAvatarIndex(userId);

  return `${DISCORD_CDN_BASE_URL}/embed/avatars/${index}.png`;
}

export function buildDiscordAvatarDecorationUrl(asset: string): string {
  return `${DISCORD_CDN_BASE_URL}/avatar-decoration-presets/${asset}.png?size=128`;
}

export function buildDiscordPrimaryGuildBadgeUrl(guildId: string, badgeHash: string): string {
  return `${DISCORD_CDN_BASE_URL}/guild-tag-badges/${guildId}/${badgeHash}.png?size=32`;
}

export function formatDiscordAccentColor(accentColor?: number | null): string | null {
  if (typeof accentColor !== "number" || !Number.isFinite(accentColor)) {
    return null;
  }

  return `#${accentColor.toString(16).padStart(6, "0").slice(-6)}`;
}

export function getDiscordProfileBadges(user: DiscordApiUser | null | undefined): DiscordProfileBadge[] {
  if (!user) return [];

  const flags = user.public_flags ?? user.flags ?? 0;
  const badges = PUBLIC_FLAG_BADGES.reduce<DiscordProfileBadge[]>((acc, badge) => {
    if ((flags & badge.bit) === badge.bit) {
      acc.push({
        key: badge.key,
        label: badge.label,
        tone: badge.tone,
      });
    }

    return acc;
  }, []);

  if (user.premium_type && user.premium_type > 0) {
    badges.push({
      key: "nitro",
      label: user.premium_type === 3 ? "Nitro Basic" : "Nitro",
      tone: "violet",
    });
  }

  return badges;
}

function getSnowflakeDefaultAvatarIndex(userId: string): number {
  try {
    return Number((BigInt(userId) >> BigInt(22)) % BigInt(6));
  } catch {
    return 0;
  }
}
