"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Shield, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/components/i18n-provider";

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
  onClose?: () => void;
  onClick?: () => void;
}

interface DiscordApiUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  banner_color?: string | null;
}

/**
 * Derives a Discord account creation date from a snowflake ID.
 */
function discordIdToCreationDate(discordId: string): Date | null {
  try {
    const id = BigInt(discordId);
    const timestamp = Number(id >> BigInt(22)) + 1420070400000;
    const date = new Date(timestamp);
    if (isNaN(date.getTime()) || date.getFullYear() < 2015 || date.getFullYear() > 2100) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Builds a CDN avatar URL from a Discord user ID and avatar hash.
 */
function buildAvatarUrl(userId: string, avatarHash: string, size = 256): string {
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
}

/**
 * Builds a CDN banner URL from a Discord user ID and banner hash.
 */
function buildBannerUrl(userId: string, bannerHash: string, size = 600): string {
  const ext = bannerHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${ext}?size=${size}`;
}

export function DiscordProfileCard({
  member,
  roleColor = "text-[var(--ep-accent)]",
  roleLabel,
  isModal = false,
  onClose,
  onClick,
}: DiscordProfileCardProps) {
  const { t } = useI18n();
  const [liveData, setLiveData] = useState<DiscordApiUser | null>(null);
  const [loading, setLoading] = useState(!!member.discordId);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!member.discordId) return;
    let isMounted = true;

    fetch(`/api/discord/${member.discordId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.user) {
          setLiveData(data.user);
        }
        if (isMounted) setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setFetchError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [member.discordId]);

  const creationDate = member.discordId ? discordIdToCreationDate(member.discordId) : null;
  const discordProfileUrl = member.discordId ? `https://discord.com/users/${member.discordId}` : null;

  // ---------- Resolve profile values ----------
  // Priority: live API data > DB-cached data > generic fallback
  const displayName =
    liveData?.global_name ||
    liveData?.username ||
    member.discordDisplayName ||
    member.discordUsername ||
    member.name;

  const username = liveData?.username
    ? `@${liveData.username}`
    : member.discordUsername
      ? `@${member.discordUsername}`
      : member.discordId
        ? " "
        : " ";

  // Avatar resolution
  const avatarUrl = (() => {
    if (liveData?.avatar && member.discordId) {
      return buildAvatarUrl(member.discordId, liveData.avatar);
    }
    if (member.discordAvatar && member.discordId) {
      return buildAvatarUrl(member.discordId, member.discordAvatar);
    }
    return member.image || "";
  })();

  // Banner resolution
  const bannerUrl = (() => {
    if (liveData?.banner && member.discordId) {
      return buildBannerUrl(member.discordId, liveData.banner);
    }
    if (member.discordBanner && member.discordId) {
      return buildBannerUrl(member.discordId, member.discordBanner);
    }
    return null;
  })();

  const fallbackBannerColor = liveData?.banner_color || "var(--ep-bg-elevated)";
  const bannerBackground = bannerUrl
    ? `url(${bannerUrl}) center/cover no-repeat`
    : `linear-gradient(135deg, ${fallbackBannerColor} 0%, rgba(78,205,196,0.15) 50%, rgba(139,92,246,0.2) 100%)`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isModal && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  const cardContent = (
    <div
      className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isModal
          ? "max-w-sm ep-scale-in shadow-[0_24px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(232,164,74,0.08),0_0_120px_rgba(232,164,74,0.06)]"
          : "max-w-[320px] ep-card-interactive shadow-lg group hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-[var(--ep-border-accent)]"
      }`}
      style={{
        background: "var(--ep-bg-surface)",
        border: "1px solid var(--ep-border)",
      }}
      role={isModal ? "dialog" : "button"}
      tabIndex={isModal ? -1 : 0}
      aria-modal={isModal ? "true" : undefined}
      aria-label={`${displayName} — ${roleLabel || member.role}`}
      onClick={!isModal ? onClick : undefined}
      onKeyDown={!isModal ? handleKeyDown : undefined}
    >
      {/* Banner */}
      <div
        className={`${isModal ? "h-28" : "h-20"} relative w-full ${loading ? "animate-pulse bg-white/5" : ""}`}
        style={{ background: loading ? undefined : bannerBackground }}
        aria-hidden="true"
      >
        {/* Gradient overlay for smooth transition into card body */}
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--ep-bg-surface)]" style={{ opacity: bannerUrl ? 0.6 : 0.8 }} />
        )}
      </div>

      {/* Close button for modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)]"
          aria-label={t.team.profile?.close ?? "Close profile"}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Avatar */}
      <div className="relative px-4 pb-4">
        <div className={`absolute ${isModal ? "-top-12" : "-top-10"} left-4 p-1.5 bg-[var(--ep-bg-surface)] rounded-full`}>
          <div className="relative">
            <Avatar className={`${isModal ? "w-20 h-20" : "w-16 h-16"} border-none shadow-xl ${loading ? "animate-pulse bg-white/10" : ""}`}>
              {!loading && <AvatarImage src={avatarUrl} className="object-cover" />}
              <AvatarFallback className="bg-gradient-to-br from-[#5865F2] to-[#7289DA] text-white font-[family-name:var(--font-heading)] font-extrabold text-2xl">
                {displayName[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div
              className={`absolute bottom-0.5 right-0.5 ${isModal ? "w-5 h-5" : "w-4 h-4"} rounded-full bg-[var(--ep-success)] border-[3px] border-[var(--ep-bg-surface)]`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className={isModal ? "pt-10 mt-2" : "pt-8 mt-2"}>
          <div className="min-h-[50px]">
            {loading ? (
              <>
                <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
              </>
            ) : (
              <>
                <h2 className={`font-bold text-[var(--ep-text-primary)] ${isModal ? "text-2xl" : "text-xl"} leading-tight truncate`}>
                  {displayName}
                </h2>
                {username.trim() && (
                  <div className="text-[var(--ep-text-muted)] text-sm mb-3 truncate">
                    {username}
                  </div>
                )}
                {!username.trim() && <div className="mb-3" />}
              </>
            )}
          </div>

          <div className="w-full h-px bg-[var(--ep-border)] my-3" />

          {/* Role Badge */}
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--ep-text-muted)] mb-1">
              {t.team.profile?.role ?? "Role"}
            </h3>
            <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md bg-[var(--ep-bg-hover)] border border-[var(--ep-border)] max-w-full">
              <Shield className={`w-3.5 h-3.5 shrink-0 ${roleColor}`} />
              <span className={`text-xs font-bold truncate ${roleColor}`}>
                {roleLabel || member.role}
              </span>
            </div>
          </div>

          {/* Expanded Modal Metadata */}
          {isModal && (
            <div className="space-y-4 mb-4">
              <div className="bg-[var(--ep-bg-deep)] rounded-xl p-3 border border-[var(--ep-border)]">
                {member.discordId && (
                  <div className="flex items-center justify-between py-1 overflow-hidden gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--ep-text-muted)] shrink-0">
                      {t.team.profile?.userId ?? "User ID"}
                    </span>
                    <span className="text-sm font-mono font-medium text-[var(--ep-text-secondary)] truncate">
                      {member.discordId}
                    </span>
                  </div>
                )}
                {creationDate && (
                  <div className={`flex items-center justify-between py-1 overflow-hidden gap-2 ${member.discordId ? "mt-2 border-t border-[var(--ep-border)] pt-2" : ""}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--ep-text-muted)] shrink-0">
                      {t.team.profile?.memberSince ?? "Member Since"}
                    </span>
                    <span className="text-sm font-medium text-[var(--ep-text-secondary)] truncate">
                      {creationDate.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Error indicator when live data failed */}
              {fetchError && !liveData && member.discordId && (
                <div className="flex items-center gap-2 text-[var(--ep-text-muted)] text-xs px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500/60" />
                  <span>Showing cached profile data</span>
                </div>
              )}

              {discordProfileUrl && (
                <a
                  href={discordProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#5865F2]/20"
                  aria-label={t.team.profile?.viewDiscord ?? "View Discord Profile"}
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.team.profile?.viewDiscord ?? "View Discord Profile"}</span>
                </a>
              )}
            </div>
          )}

          {/* Hint for non-modal cards */}
          {!isModal && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ep-text-muted)] text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        <div className="relative z-10 flex w-full max-w-sm justify-center">
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
}
