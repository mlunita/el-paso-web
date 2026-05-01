"use client";

import Image from "next/image";
import { X, ExternalLink, Shield, AlertCircle, BadgeCheck, Hash, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/components/i18n-provider";
import {
  buildDiscordAvatarDecorationUrl,
  buildDiscordAvatarUrl,
  buildDiscordBannerUrl,
  buildDiscordDefaultAvatarUrl,
  buildDiscordPrimaryGuildBadgeUrl,
  formatDiscordAccentColor,
  getDiscordProfileBadges,
  type DiscordProfileBadge,
} from "@/lib/discord-profile";
import { useDiscordProfile } from "@/lib/use-discord-profile";

interface DiscordProfileMember {
  id: string;
  name: string;
  role: string;
  image?: string | null;
  discordId?: string | null;
  discordUsername?: string | null;
  discordDisplayName?: string | null;
  discordAvatar?: string | null;
  discordBanner?: string | null;
  createdAt?: string | Date;
}

interface DiscordProfileCardProps {
  member: DiscordProfileMember;
  roleColor?: string;
  roleLabel?: string;
  isModal?: boolean;
  compact?: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

const BADGE_TONE_CLASSES: Record<DiscordProfileBadge["tone"], string> = {
  brand: "bg-[#5865F2]/15 text-[#B8C0FF] border-[#5865F2]/25",
  gold: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  red: "bg-red-500/15 text-red-300 border-red-500/25",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/25",
};

function discordIdToCreationDate(discordId: string): Date | null {
  try {
    const id = BigInt(discordId);
    const timestamp = Number(id >> BigInt(22)) + 1420070400000;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime()) || date.getFullYear() < 2015 || date.getFullYear() > 2100) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

function formatHandle(username?: string | null, discriminator?: string | null) {
  if (!username) return "";
  if (discriminator && discriminator !== "0") {
    return `@${username}#${discriminator}`;
  }
  return `@${username}`;
}

function formatCompactId(discordId?: string | null) {
  if (!discordId) return "";
  return `ID ${discordId.slice(-6)}`;
}

export function DiscordProfileCard({
  member,
  roleColor = "text-[var(--ep-accent)]",
  roleLabel,
  isModal = false,
  compact = false,
  onClose,
  onClick,
}: DiscordProfileCardProps) {
  const { t } = useI18n();
  const { user: liveData, loading, error: fetchError } = useDiscordProfile(member.discordId);

  const profileLoading = Boolean(member.discordId && loading && !liveData);
  const creationDate = member.discordId ? discordIdToCreationDate(member.discordId) : null;
  const discordProfileUrl = member.discordId ? `https://discord.com/users/${member.discordId}` : null;
  const displayName =
    liveData?.global_name ||
    liveData?.username ||
    member.discordDisplayName ||
    member.discordUsername ||
    member.name;
  const username = formatHandle(liveData?.username || member.discordUsername, liveData?.discriminator);
  const compactSubline = username || formatCompactId(member.discordId) || roleLabel || member.role;
  const avatarUrl = (() => {
    if (liveData?.avatar && member.discordId) {
      return buildDiscordAvatarUrl(member.discordId, liveData.avatar, isModal ? 256 : 128);
    }
    if (member.discordAvatar && member.discordId) {
      return buildDiscordAvatarUrl(member.discordId, member.discordAvatar, isModal ? 256 : 128);
    }
    if (member.image) {
      return member.image;
    }
    if (member.discordId) {
      return buildDiscordDefaultAvatarUrl(member.discordId, liveData?.discriminator);
    }
    return "";
  })();
  const bannerUrl = (() => {
    if (liveData?.banner && member.discordId) {
      return buildDiscordBannerUrl(member.discordId, liveData.banner, isModal ? 1024 : 600);
    }
    if (member.discordBanner && member.discordId) {
      return buildDiscordBannerUrl(member.discordId, member.discordBanner, isModal ? 1024 : 600);
    }
    return null;
  })();
  const accentColor = formatDiscordAccentColor(liveData?.accent_color) || liveData?.banner_color || "var(--ep-bg-elevated)";
  const bannerBackground = bannerUrl
    ? `url(${bannerUrl}) center/cover no-repeat`
    : `linear-gradient(135deg, ${accentColor} 0%, rgba(88,101,242,0.18) 46%, rgba(232,164,74,0.14) 100%)`;
  const badges = getDiscordProfileBadges(liveData);
  const visibleBadges = compact ? badges.slice(0, 2) : badges.slice(0, 5);
  const hiddenBadgeCount = Math.max(0, badges.length - visibleBadges.length);
  const avatarDecorationUrl = liveData?.avatar_decoration_data?.asset
    ? buildDiscordAvatarDecorationUrl(liveData.avatar_decoration_data.asset)
    : null;
  const primaryGuild = liveData?.primary_guild;
  const primaryGuildBadgeUrl = primaryGuild?.identity_guild_id && primaryGuild.badge
    ? buildDiscordPrimaryGuildBadgeUrl(primaryGuild.identity_guild_id, primaryGuild.badge)
    : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isModal && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  if (!isModal && compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className="group flex h-[52px] w-full items-center gap-3 rounded-xl border border-[var(--ep-border)] bg-[var(--ep-bg-elevated)]/80 px-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]"
        aria-label={`${displayName} - ${roleLabel || member.role}`}
      >
        <div className="relative shrink-0">
          <Avatar className={`h-9 w-9 ${profileLoading ? "animate-pulse bg-white/10" : ""}`}>
            {!profileLoading && avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
            <AvatarFallback className="bg-gradient-to-br from-[#5865F2] to-[#7289DA] text-white text-sm font-extrabold">
              {displayName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          {avatarDecorationUrl && (
            <span className="pointer-events-none absolute -inset-1.5" aria-hidden="true">
              <Image src={avatarDecorationUrl} alt="" fill sizes="48px" className="object-contain" unoptimized />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-[var(--ep-text-primary)]">
              {displayName}
            </span>
            {badges.length > 0 && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#5865F2]" aria-label={t.team.profile?.badges ?? "Badges"} />
            )}
          </div>
          <span className="block truncate text-[11px] font-medium text-[var(--ep-text-muted)]">
            {compactSubline}
          </span>
        </div>
      </button>
    );
  }

  const cardContent = (
    <div
      className={`relative w-full overflow-hidden rounded-2xl transition-all duration-300 ${
        isModal
          ? "max-w-md ep-scale-in shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(88,101,242,0.14),0_0_120px_rgba(88,101,242,0.08)]"
          : "max-w-[320px] ep-card-interactive shadow-lg group hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-[var(--ep-border-accent)]"
      }`}
      style={{
        background: "var(--ep-bg-surface)",
        border: "1px solid var(--ep-border)",
      }}
      role={isModal ? "dialog" : "button"}
      tabIndex={isModal ? -1 : 0}
      aria-modal={isModal ? "true" : undefined}
      aria-label={`${displayName} - ${roleLabel || member.role}`}
      onClick={!isModal ? onClick : undefined}
      onKeyDown={!isModal ? handleKeyDown : undefined}
    >
      <div
        className={`${isModal ? "h-32" : "h-20"} relative w-full ${profileLoading ? "animate-pulse bg-white/5" : ""}`}
        style={{ background: profileLoading ? undefined : bannerBackground }}
        aria-hidden="true"
      >
        {!profileLoading && (
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ep-bg-surface)]"
            style={{ opacity: bannerUrl ? 0.6 : 0.82 }}
          />
        )}
      </div>

      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-black/65 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]"
          aria-label={t.team.profile?.close ?? "Close profile"}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="relative px-4 pb-4">
        <div className={`absolute ${isModal ? "-top-14" : "-top-10"} left-4 rounded-full bg-[var(--ep-bg-surface)] p-1.5`}>
          <div className="relative">
            <Avatar className={`${isModal ? "h-24 w-24" : "h-16 w-16"} shadow-xl ${profileLoading ? "animate-pulse bg-white/10" : ""}`}>
              {!profileLoading && avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
              <AvatarFallback className="bg-gradient-to-br from-[#5865F2] to-[#7289DA] text-2xl font-extrabold text-white">
                {displayName[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            {avatarDecorationUrl && (
              <span className="pointer-events-none absolute -inset-3" aria-hidden="true">
                <Image src={avatarDecorationUrl} alt="" fill sizes={isModal ? "120px" : "88px"} className="object-contain" unoptimized />
              </span>
            )}
          </div>
        </div>

        <div className={isModal ? "pt-14 mt-2" : "pt-8 mt-2"}>
          <div className="min-h-[54px]">
            {profileLoading ? (
              <>
                <div className="mb-2 h-6 w-36 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className={`truncate font-bold leading-tight text-[var(--ep-text-primary)] ${isModal ? "text-2xl" : "text-xl"}`}>
                      {displayName}
                    </h2>
                    {username && (
                      <div className="mt-0.5 truncate text-sm text-[var(--ep-text-muted)]">
                        {username}
                      </div>
                    )}
                  </div>
                  {primaryGuild?.tag && (
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-[var(--ep-text-secondary)]">
                      {primaryGuildBadgeUrl && (
                        <Image src={primaryGuildBadgeUrl} alt="" width={14} height={14} className="rounded-sm" unoptimized />
                      )}
                      {primaryGuild.tag}
                    </div>
                  )}
                </div>
                {member.discordId && (
                  <div className="mt-2 flex items-center gap-1.5 truncate text-xs font-mono text-[var(--ep-text-muted)]">
                    <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {member.discordId}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="my-3 h-px w-full bg-[var(--ep-border)]" />

          <div className="mb-4 flex flex-col gap-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ep-text-muted)]">
              {t.team.profile?.role ?? "Role"}
            </h3>
            <div className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border border-[var(--ep-border)] bg-[var(--ep-bg-hover)] px-2.5 py-1">
              <Shield className={`h-3.5 w-3.5 shrink-0 ${roleColor}`} />
              <span className={`truncate text-xs font-bold ${roleColor}`}>
                {roleLabel || member.role}
              </span>
            </div>
          </div>

          {(visibleBadges.length > 0 || primaryGuild?.tag) && (
            <div className="mb-4">
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--ep-text-muted)]">
                {t.team.profile?.badges ?? "Badges"}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {visibleBadges.map((badge) => (
                  <span
                    key={badge.key}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${BADGE_TONE_CLASSES[badge.tone]}`}
                  >
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {badge.label}
                  </span>
                ))}
                {hiddenBadgeCount > 0 && (
                  <span className="inline-flex items-center rounded-full border border-[var(--ep-border)] bg-[var(--ep-bg-hover)] px-2 py-1 text-[10px] font-bold text-[var(--ep-text-muted)]">
                    {t.common.more(hiddenBadgeCount)}
                  </span>
                )}
              </div>
            </div>
          )}

          {isModal && (
            <div className="mb-4 space-y-4">
              <div className="rounded-xl border border-[var(--ep-border)] bg-[var(--ep-bg-deep)] p-3">
                {member.discordId && (
                  <div className="flex items-center justify-between gap-3 overflow-hidden py-1">
                    <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-[var(--ep-text-muted)]">
                      {t.team.profile?.userId ?? "User ID"}
                    </span>
                    <span className="truncate font-mono text-sm font-medium text-[var(--ep-text-secondary)]">
                      {member.discordId}
                    </span>
                  </div>
                )}
                {creationDate && (
                  <div className={`flex items-center justify-between gap-3 overflow-hidden py-1 ${member.discordId ? "mt-2 border-t border-[var(--ep-border)] pt-2" : ""}`}>
                    <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-[var(--ep-text-muted)]">
                      {t.team.profile?.memberSince ?? "Member Since"}
                    </span>
                    <span className="truncate text-sm font-medium text-[var(--ep-text-secondary)]">
                      {creationDate.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {fetchError && !liveData && member.discordId && (
                <div className="flex items-center gap-2 px-1 text-xs text-[var(--ep-text-muted)]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500/70" />
                  <span>{t.team.profile?.cachedFallback ?? "Showing cached profile data"}</span>
                </div>
              )}

              {discordProfileUrl && (
                <a
                  href={discordProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#4752C4] hover:shadow-lg hover:shadow-[#5865F2]/20"
                  aria-label={t.team.profile?.viewDiscord ?? "View Discord Profile"}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t.team.profile?.viewDiscord ?? "View Discord Profile"}</span>
                </a>
              )}
            </div>
          )}

          {!isModal && (
            <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--ep-text-muted)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {t.team.profile?.clickToView ?? "Click to view profile"}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm ep-fade-in" onClick={onClose} aria-hidden="true" />
        <div className="relative z-10 flex w-full max-w-md justify-center">
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
}
