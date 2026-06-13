"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
  X,
  ChevronDown,
  Shield,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Clock,
  History,
  ExternalLink,
  Trash2,
  Edit3,
  Users,
  Copy,
  Check,
} from "lucide-react";


/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface NameHistoryEntry {
  name: string;
  detectedAt: string; // ISO date
}

interface CommunityBan {
  name: string;
  date: string; // ISO date
}

interface BlacklistUser {
  id: string;
  discord: {
    username: string;
    userId: string;
    avatarUrl: string;
    nameHistory: NameHistoryEntry[];
  };
  roblox: {
    username: string;
    displayName: string;
    userId: string;
    avatarUrl: string;
    nameHistory: NameHistoryEntry[];
  };
  moderation: {
    addedAt: string; // ISO date
    reasons: string[];
    tags: string[];
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    communities: CommunityBan[];
    evidence: string[];
    declarationPdf?: string;
  };
}

type SortField = "date" | "name" | "communities" | "severity";
type SortDirection = "asc" | "desc";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "ep-blacklist-data";

const SEVERITY_CONFIG = {
  LOW: { color: "#3498db", bg: "rgba(52,152,219,0.12)", label: "Low" },
  MEDIUM: { color: "#f39c12", bg: "rgba(243,156,18,0.12)", label: "Medium" },
  HIGH: { color: "#e74c3c", bg: "rgba(231,76,60,0.12)", label: "High" },
  CRITICAL: { color: "#c0392b", bg: "rgba(192,57,43,0.18)", label: "Critical" },
};

const SEVERITY_BORDER = {
  LOW: "#3498db",
  MEDIUM: "#f39c12",
  HIGH: "#e74c3c",
  CRITICAL: "#c0392b",
};

const SEVERITY_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

const TAG_PRESETS = [
  "Toxic",
  "Cheater",
  "Scammer",
  "NSFW",
  "Raider",
  "Exploiter",
  "Harassment",
  "Impersonation",
  "Spam",
  "Underage",
];

const TAG_COLORS: Record<string, string> = {
  Toxic: "#e74c3c",
  Cheater: "#e67e22",
  Scammer: "#f39c12",
  NSFW: "#9b59b6",
  Raider: "#c0392b",
  Exploiter: "#e74c3c",
  Harassment: "#d35400",
  Impersonation: "#2980b9",
  Spam: "#7f8c8d",
  Underage: "#e74c3c",
};

/* ═══════════════════════════════════════════
   SEED DATA
   ═══════════════════════════════════════════ */

function generateId() {
  return `bl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SAMPLE_USERS: BlacklistUser[] = [
  {
    id: generateId(),
    discord: {
      username: "darkflame_99",
      userId: "123456789012345678",
      avatarUrl: "",
      nameHistory: [
        { name: "xXdarkflameXx", detectedAt: "2025-11-20T10:00:00Z" },
        { name: "flame_destroyer", detectedAt: "2026-01-05T14:30:00Z" },
      ],
    },
    roblox: {
      username: "DarkFlameRBX",
      displayName: "DarkFlame",
      userId: "987654321",
      avatarUrl: "",
      nameHistory: [
        { name: "FlameKid2020", detectedAt: "2025-09-12T08:00:00Z" },
      ],
    },
    moderation: {
      addedAt: "2026-02-15T18:00:00Z",
      reasons: [
        "Repeated toxic behavior in voice channels. Multiple warnings ignored.",
        "Used racial slurs and targeted harassment against new members.",
      ],
      tags: ["Toxic", "Harassment"],
      severity: "HIGH",
      communities: [
        { name: "El Paso RP", date: "2026-02-15T18:00:00Z" },
        { name: "SoCal RP", date: "2026-02-20T12:00:00Z" },
        { name: "Texas RP Hub", date: "2026-03-01T09:00:00Z" },
        { name: "BorderLine RP", date: "2026-03-10T15:00:00Z" },
      ],
      evidence: [
        "https://imgur.com/evidence1",
        "https://imgur.com/evidence2",
      ],
    },
  },
  {
    id: generateId(),
    discord: {
      username: "ghosthacker",
      userId: "234567890123456789",
      avatarUrl: "",
      nameHistory: [],
    },
    roblox: {
      username: "Gh0stH4ck3r",
      displayName: "GhostHacker",
      userId: "112233445",
      avatarUrl: "",
      nameHistory: [
        { name: "HackerBoy123", detectedAt: "2025-06-01T10:00:00Z" },
        { name: "ProExploiter", detectedAt: "2025-10-15T16:00:00Z" },
      ],
    },
    moderation: {
      addedAt: "2026-01-10T09:00:00Z",
      reasons: [
        "Caught using speed hacks and fly exploits in multiple sessions.",
        "Distributed exploit scripts in DMs to other players.",
      ],
      tags: ["Cheater", "Exploiter"],
      severity: "CRITICAL",
      communities: [
        { name: "El Paso RP", date: "2026-01-10T09:00:00Z" },
        { name: "SoCal RP", date: "2026-01-12T11:00:00Z" },
        { name: "Horizon Roleplay", date: "2026-01-15T08:00:00Z" },
        { name: "Texas RP Hub", date: "2026-01-18T14:00:00Z" },
        { name: "CityLife RP", date: "2026-01-20T10:00:00Z" },
        { name: "BorderLine RP", date: "2026-02-01T09:00:00Z" },
        { name: "Desert Storm RP", date: "2026-02-05T12:00:00Z" },
        { name: "Lone Star RP", date: "2026-02-10T16:00:00Z" },
      ],
      evidence: [
        "https://imgur.com/exploit_proof1",
        "https://imgur.com/exploit_proof2",
        "https://imgur.com/exploit_proof3",
      ],
    },
  },
  {
    id: generateId(),
    discord: {
      username: "tradequeen",
      userId: "345678901234567890",
      avatarUrl: "",
      nameHistory: [
        { name: "legittrader2024", detectedAt: "2025-08-20T12:00:00Z" },
      ],
    },
    roblox: {
      username: "TradeQueenRBX",
      displayName: "TradeQueen",
      userId: "556677889",
      avatarUrl: "",
      nameHistory: [],
    },
    moderation: {
      addedAt: "2026-04-01T14:00:00Z",
      reasons: [
        "Scammed 3 users out of in-game currency through fake trade offers.",
      ],
      tags: ["Scammer"],
      severity: "MEDIUM",
      communities: [
        { name: "El Paso RP", date: "2026-04-01T14:00:00Z" },
        { name: "Trade Hub Central", date: "2026-04-05T10:00:00Z" },
      ],
      evidence: ["https://imgur.com/scam_proof1"],
    },
  },
  {
    id: generateId(),
    discord: {
      username: "minimod_kid",
      userId: "456789012345678901",
      avatarUrl: "",
      nameHistory: [],
    },
    roblox: {
      username: "CoolKid2015",
      displayName: "CoolKid",
      userId: "998877665",
      avatarUrl: "",
      nameHistory: [
        { name: "CoolKidOriginal", detectedAt: "2026-01-01T10:00:00Z" },
      ],
    },
    moderation: {
      addedAt: "2026-05-20T11:00:00Z",
      reasons: ["Minor spamming in general chat. Given a soft ban as warning."],
      tags: ["Spam"],
      severity: "LOW",
      communities: [
        { name: "El Paso RP", date: "2026-05-20T11:00:00Z" },
      ],
      evidence: [],
    },
  },
];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function loadData(): BlacklistUser[] {
  return SAMPLE_USERS;
}

function saveData(users: BlacklistUser[]) {
  // Persistence is now handled via database
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(/[\s_]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/* ═══════════════════════════════════════════
   AVATAR COMPONENT
   ═══════════════════════════════════════════ */

function Avatar({
  url,
  name,
  size = 40,
  borderColor,
}: {
  url: string;
  name: string;
  size?: number;
  borderColor?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(name);

  if (!url || failed) {
    return (
      <div
        className="shrink-0 rounded-full flex items-center justify-center font-bold text-xs"
        style={{
          width: size,
          height: size,
          background: "rgba(192,57,43,0.15)",
          color: "#c0392b",
          border: borderColor ? `2px solid ${borderColor}` : "2px solid #1e1e1e",
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{
        border: borderColor ? `2px solid ${borderColor}` : "2px solid #1e1e1e",
      }}
      onError={() => setFailed(true)}
    />
  );
}

/* ═══════════════════════════════════════════
   COPY BUTTON
   ═══════════════════════════════════════════ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 rounded hover:bg-white/5 transition-colors"
      title="Copy"
    >
      {copied ? (
        <Check className="w-3 h-3 text-[#27ae60]" />
      ) : (
        <Copy className="w-3 h-3 text-[#666]" />
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════
   TAG / BADGE
   ═══════════════════════════════════════════ */

function TagBadge({ tag, removable, onRemove }: { tag: string; removable?: boolean; onRemove?: () => void }) {
  const color = TAG_COLORS[tag] || "#666";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {tag}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: keyof typeof SEVERITY_CONFIG }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {severity === "CRITICAL" && <ShieldX className="w-3 h-3" />}
      {severity === "HIGH" && <ShieldAlert className="w-3 h-3" />}
      {severity === "MEDIUM" && <AlertTriangle className="w-3 h-3" />}
      {severity === "LOW" && <Shield className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

/* ═══════════════════════════════════════════
   NAME HISTORY MODAL
   ═══════════════════════════════════════════ */

function NameHistoryModal({
  title,
  history,
  onClose,
}: {
  title: string;
  history: NameHistoryEntry[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: "#141414", border: "1px solid #1e1e1e" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"
            style={{ color: "#e8e8e8" }}
          >
            <History className="w-4 h-4 text-[#c0392b]" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-[#666]" />
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-[#666] text-center py-4">No name changes recorded.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
              )
              .map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                  style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}
                >
                  <span className="text-sm font-medium text-[#e8e8e8]">
                    {entry.name}
                  </span>
                  <span className="text-xs text-[#666] flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(entry.detectedAt)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   USER CARD
   ═══════════════════════════════════════════ */

function UserCard({
  user,
  onView,
  onEdit,
  onDelete,
  readOnly,
}: {
  user: BlacklistUser;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}) {
  const [showDiscordHistory, setShowDiscordHistory] = useState(false);
  const [showRobloxHistory, setShowRobloxHistory] = useState(false);
  const severity = user.moderation.severity;
  const borderColor = SEVERITY_BORDER[severity];

  return (
    <>
      <div
        className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
        style={{
          background: "#141414",
          borderLeft: `3px solid ${borderColor}`,
          border: `1px solid #1e1e1e`,
          borderLeftWidth: "3px",
          borderLeftColor: borderColor,
        }}
        onClick={onView}
        id={`blacklist-card-${user.id}`}
      >
        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top left, ${borderColor}08 0%, transparent 70%)`,
          }}
        />

        <div className="relative p-5 sm:p-6">
          {/* Top row: avatars + severity */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  url={user.discord.avatarUrl}
                  name={user.discord.username}
                  size={44}
                  borderColor={borderColor}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: "#5865F2", color: "#fff" }}
                  title="Discord"
                >
                  D
                </div>
              </div>
              <div className="relative">
                <Avatar
                  url={user.roblox.avatarUrl}
                  name={user.roblox.username}
                  size={44}
                  borderColor={borderColor}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: "#e2231a", color: "#fff" }}
                  title="Roblox"
                >
                  R
                </div>
              </div>
            </div>
            <SeverityBadge severity={severity} />
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-1">
                Discord
              </p>
              <p className="text-sm font-semibold text-[#e8e8e8] truncate">
                @{user.discord.username}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-[11px] text-[#666] font-mono truncate">
                  {user.discord.userId}
                </p>
                <CopyButton text={user.discord.userId} />
              </div>
              {user.discord.nameHistory.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDiscordHistory(true);
                  }}
                  className="mt-1 text-[10px] font-semibold text-[#c0392b] hover:text-[#e74c3c] transition-colors flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  {user.discord.nameHistory.length} alias
                  {user.discord.nameHistory.length > 1 ? "es" : ""}
                </button>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-1">
                Roblox
              </p>
              <p className="text-sm font-semibold text-[#e8e8e8] truncate">
                {user.roblox.username}
              </p>
              <p className="text-[11px] text-[#666] truncate">
                {user.roblox.displayName}{" "}
                <span className="font-mono">#{user.roblox.userId}</span>
              </p>
              {user.roblox.nameHistory.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRobloxHistory(true);
                  }}
                  className="mt-1 text-[10px] font-semibold text-[#c0392b] hover:text-[#e74c3c] transition-colors flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  {user.roblox.nameHistory.length} alias
                  {user.roblox.nameHistory.length > 1 ? "es" : ""}
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          {user.moderation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {user.moderation.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {/* Reason preview */}
          <p className="text-xs text-[#666] leading-relaxed line-clamp-2 mb-4">
            {user.moderation.reasons[0] || "No reason provided."}
          </p>

          {/* Footer: communities + date + actions */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #1e1e1e" }}>
            <div className="flex items-center gap-3">

              <span className="text-[10px] text-[#666] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(user.moderation.addedAt)}
              </span>
            </div>
            {!readOnly && onEdit && onDelete && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#666]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#c0392b]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDiscordHistory && (
        <NameHistoryModal
          title="Discord Name History"
          history={user.discord.nameHistory}
          onClose={() => setShowDiscordHistory(false)}
        />
      )}
      {showRobloxHistory && (
        <NameHistoryModal
          title="Roblox Name History"
          history={user.roblox.nameHistory}
          onClose={() => setShowRobloxHistory(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════ */

function DetailModal({
  user,
  onClose,
  onEdit,
  readOnly,
}: {
  user: BlacklistUser;
  onClose: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
}) {
  const severity = user.moderation.severity;
  const borderColor = SEVERITY_BORDER[severity];
  const [showDiscordHistory, setShowDiscordHistory] = useState(false);
  const [showRobloxHistory, setShowRobloxHistory] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={onClose}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden mb-20"
          style={{
            background: "#0d0d0d",
            border: "1px solid #1e1e1e",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1" style={{ background: borderColor }} />

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar url={user.discord.avatarUrl} name={user.discord.username} size={56} borderColor={borderColor} />
                <div>
                  <h2 className="text-xl font-bold text-[#e8e8e8]">@{user.discord.username}</h2>
                  <p className="text-sm text-[#666]">
                    {user.roblox.displayName} ({user.roblox.username})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={severity} />
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-[#666]" />
                </button>
              </div>
            </div>

            {/* Discord & Roblox sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Discord */}
              <div className="rounded-xl p-4" style={{ background: "#141414", border: "1px solid #1e1e1e" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: "#5865F2", color: "#fff" }}
                  >
                    D
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#666]">Discord</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] uppercase tracking-wider">Username</span>
                    <span className="text-sm font-medium text-[#e8e8e8]">@{user.discord.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] uppercase tracking-wider">User ID</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-[#e8e8e8]">{user.discord.userId}</span>
                      <CopyButton text={user.discord.userId} />
                    </div>
                  </div>
                  {user.discord.nameHistory.length > 0 && (
                    <button
                      onClick={() => setShowDiscordHistory(true)}
                      className="w-full mt-2 text-[10px] font-bold uppercase tracking-wider text-[#c0392b] hover:text-[#e74c3c] transition-colors flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-white/[0.02]"
                    >
                      <History className="w-3 h-3" />
                      View {user.discord.nameHistory.length} previous name
                      {user.discord.nameHistory.length > 1 ? "s" : ""}
                    </button>
                  )}
                </div>
              </div>

              {/* Roblox */}
              <div className="rounded-xl p-4" style={{ background: "#141414", border: "1px solid #1e1e1e" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: "#e2231a", color: "#fff" }}
                  >
                    R
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#666]">Roblox</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] uppercase tracking-wider">Username</span>
                    <span className="text-sm font-medium text-[#e8e8e8]">{user.roblox.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] uppercase tracking-wider">Display Name</span>
                    <span className="text-sm font-medium text-[#e8e8e8]">{user.roblox.displayName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#666] uppercase tracking-wider">User ID</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono text-[#e8e8e8]">{user.roblox.userId}</span>
                      <CopyButton text={user.roblox.userId} />
                    </div>
                  </div>
                  {user.roblox.nameHistory.length > 0 && (
                    <button
                      onClick={() => setShowRobloxHistory(true)}
                      className="w-full mt-2 text-[10px] font-bold uppercase tracking-wider text-[#c0392b] hover:text-[#e74c3c] transition-colors flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-white/[0.02]"
                    >
                      <History className="w-3 h-3" />
                      View {user.roblox.nameHistory.length} previous name
                      {user.roblox.nameHistory.length > 1 ? "s" : ""}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {user.moderation.tags.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.moderation.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            )}

            {/* Reasons */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-2">
                Reasons ({user.moderation.reasons.length})
              </p>
              <div className="space-y-2">
                {user.moderation.reasons.map((reason, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 rounded-xl text-sm text-[#e8e8e8] leading-relaxed"
                    style={{ background: "#141414", border: "1px solid #1e1e1e" }}
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>



            {/* Declaration PDF */}
            {user.moderation.declarationPdf && (
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-2">Declaration</p>
                <a
                  href={user.moderation.declarationPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#c0392b] hover:bg-white/5 transition-colors"
                  style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)" }}
                >
                  <ExternalLink className="w-4 h-4" />
                  View PDF Declaration
                </a>
              </div>
            )}

            {/* Evidence */}
            {user.moderation.evidence.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-2">Evidence</p>
                <div className="space-y-1.5">
                  {user.moderation.evidence.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-[#3498db] hover:text-[#5dade2] transition-colors truncate"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div
              className="flex items-center justify-between pt-4 mt-2"
              style={{ borderTop: "1px solid #1e1e1e" }}
            >
              <span className="text-[10px] text-[#666] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Added {formatDateTime(user.moderation.addedAt)}
              </span>
              {!readOnly && onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: "rgba(192,57,43,0.1)",
                    color: "#c0392b",
                    border: "1px solid rgba(192,57,43,0.2)",
                  }}
                >
                  <Edit3 className="w-3 h-3 inline mr-1.5" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDiscordHistory && (
        <NameHistoryModal
          title="Discord Name History"
          history={user.discord.nameHistory}
          onClose={() => setShowDiscordHistory(false)}
        />
      )}
      {showRobloxHistory && (
        <NameHistoryModal
          title="Roblox Name History"
          history={user.roblox.nameHistory}
          onClose={() => setShowRobloxHistory(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   FORM MODAL (Add / Edit)
   ═══════════════════════════════════════════ */

function emptyUser(): BlacklistUser {
  return {
    id: generateId(),
    discord: { username: "", userId: "", avatarUrl: "", nameHistory: [] },
    roblox: { username: "", displayName: "", userId: "", avatarUrl: "", nameHistory: [] },
    moderation: {
      addedAt: new Date().toISOString(),
      reasons: [""],
      tags: [],
      severity: "MEDIUM",
      communities: [{ name: "", date: new Date().toISOString() }],
      evidence: [""],
      declarationPdf: "",
    },
  };
}

function FormModal({
  initial,
  onSave,
  onClose,
  existingUsers,
  onFetchDiscordUser,
  onFetchRobloxUser,
}: {
  initial: BlacklistUser | null;
  onSave: (user: BlacklistUser, isNew: boolean) => void;
  onClose: () => void;
  existingUsers: BlacklistUser[];
  onFetchDiscordUser?: (id: string) => Promise<any>;
  onFetchRobloxUser?: (id: string) => Promise<any>;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<BlacklistUser>(initial ? structuredClone(initial) : emptyUser());
  const [showDuplicatePrompt, setShowDuplicatePrompt] = useState(false);
  const [duplicateUser, setDuplicateUser] = useState<BlacklistUser | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [discordLoading, setDiscordLoading] = useState(false);
  const [robloxLoading, setRobloxLoading] = useState(false);

  const updateDiscord = (patch: Partial<BlacklistUser["discord"]>) =>
    setForm((f) => ({ ...f, discord: { ...f.discord, ...patch } }));
  const updateRoblox = (patch: Partial<BlacklistUser["roblox"]>) =>
    setForm((f) => ({ ...f, roblox: { ...f.roblox, ...patch } }));
  const updateMod = (patch: Partial<BlacklistUser["moderation"]>) =>
    setForm((f) => ({ ...f, moderation: { ...f.moderation, ...patch } }));

  const toggleTag = (tag: string) => {
    const current = form.moderation.tags;
    if (current.includes(tag)) {
      updateMod({ tags: current.filter((t) => t !== tag) });
    } else {
      updateMod({ tags: [...current, tag] });
    }
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !form.moderation.tags.includes(t)) {
      updateMod({ tags: [...form.moderation.tags, t] });
      setCustomTag("");
    }
  };

  const handleSubmit = () => {
    if (!form.discord.username && !form.roblox.username) return;

    if (!isEdit) {
      const dup = existingUsers.find(
        (u) =>
          (form.discord.username && u.discord.username.toLowerCase() === form.discord.username.toLowerCase()) ||
          (form.discord.userId && u.discord.userId === form.discord.userId) ||
          (form.roblox.username && u.roblox.username.toLowerCase() === form.roblox.username.toLowerCase()) ||
          (form.roblox.userId && u.roblox.userId === form.roblox.userId)
      );
      if (dup) {
        setDuplicateUser(dup);
        setShowDuplicatePrompt(true);
        return;
      }
    }

    const cleaned = {
      ...form,
      moderation: {
        ...form.moderation,
        reasons: form.moderation.reasons.filter((r) => r.trim()),
        communities: form.moderation.communities.filter((c) => c.name.trim()),
        evidence: form.moderation.evidence.filter((e) => e.trim()),
      },
    };

    // If editing and names changed, track the old names
    if (isEdit && initial) {
      if (
        form.discord.username !== initial.discord.username &&
        initial.discord.username.trim()
      ) {
        cleaned.discord.nameHistory = [
          ...cleaned.discord.nameHistory,
          { name: initial.discord.username, detectedAt: new Date().toISOString() },
        ];
      }
      if (
        form.roblox.username !== initial.roblox.username &&
        initial.roblox.username.trim()
      ) {
        cleaned.roblox.nameHistory = [
          ...cleaned.roblox.nameHistory,
          { name: initial.roblox.username, detectedAt: new Date().toISOString() },
        ];
      }
    }

    onSave(cleaned, !isEdit);
  };

  const handleMerge = () => {
    if (!duplicateUser) return;
    // Merge: update the existing user with the new data, move old names to history
    const merged: BlacklistUser = {
      ...duplicateUser,
      discord: {
        ...form.discord,
        nameHistory: [
          ...duplicateUser.discord.nameHistory,
          ...(duplicateUser.discord.username !== form.discord.username && duplicateUser.discord.username.trim()
            ? [{ name: duplicateUser.discord.username, detectedAt: new Date().toISOString() }]
            : []),
        ],
      },
      roblox: {
        ...form.roblox,
        nameHistory: [
          ...duplicateUser.roblox.nameHistory,
          ...(duplicateUser.roblox.username !== form.roblox.username && duplicateUser.roblox.username.trim()
            ? [{ name: duplicateUser.roblox.username, detectedAt: new Date().toISOString() }]
            : []),
        ],
      },
      moderation: {
        ...form.moderation,
        addedAt: duplicateUser.moderation.addedAt,
        reasons: [...new Set([...duplicateUser.moderation.reasons, ...form.moderation.reasons.filter(r => r.trim())])],
        tags: [...new Set([...duplicateUser.moderation.tags, ...form.moderation.tags])],
        communities: [...duplicateUser.moderation.communities, ...form.moderation.communities.filter(c => c.name.trim())],
        evidence: [...new Set([...duplicateUser.moderation.evidence, ...form.moderation.evidence.filter(e => e.trim())])],
      },
    };
    onSave(merged, false);
    setShowDuplicatePrompt(false);
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg text-sm text-[#e8e8e8] placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#c0392b]/40 transition-all duration-200";
  const inputStyle = { background: "#0d0d0d", border: "1px solid #1e1e1e" };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={onClose}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden mb-20"
          style={{ background: "#141414", border: "1px solid #1e1e1e" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-1 bg-[#c0392b]" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#e8e8e8] flex items-center gap-2">
                <ShieldX className="w-5 h-5 text-[#c0392b]" />
                {isEdit ? "Edit Blacklisted User" : "Add to Blacklist"}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 text-[#666]" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Discord section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] mb-3 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#5865F2] flex items-center justify-center text-[7px] font-bold text-white">D</div>
                  Discord Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Username (e.g. @user)"
                    value={form.discord.username}
                    onChange={(e) => updateDiscord({ username: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      style={inputStyle}
                      placeholder="User ID (snowflake)"
                      value={form.discord.userId}
                      onChange={(e) => updateDiscord({ userId: e.target.value })}
                    />
                    {onFetchDiscordUser && (
                      <button
                        type="button"
                        disabled={discordLoading}
                        onClick={async () => {
                          if (!form.discord.userId) return;
                          setDiscordLoading(true);
                          try {
                            const data = await onFetchDiscordUser(form.discord.userId);
                            if (data) {
                              updateDiscord({
                                username: data.username || form.discord.username,
                                avatarUrl: data.avatarUrl || form.discord.avatarUrl,
                              });
                            } else {
                              alert("User not found. Check the ID.");
                            }
                          } finally {
                            setDiscordLoading(false);
                          }
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                          discordLoading
                            ? "bg-[#5865F2]/20 text-[#5865F2] cursor-wait"
                            : "bg-white/5 hover:bg-[#5865F2]/20 text-zinc-300 hover:text-[#5865F2]"
                        }`}
                      >
                        {discordLoading ? "Loading..." : "Auto-fill"}
                      </button>
                    )}
                  </div>
                  <input
                    className={`${inputCls} sm:col-span-2`}
                    style={inputStyle}
                    placeholder="Avatar URL (optional)"
                    value={form.discord.avatarUrl}
                    onChange={(e) => updateDiscord({ avatarUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Roblox section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] mb-3 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#e2231a] flex items-center justify-center text-[7px] font-bold text-white">R</div>
                  Roblox Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Username"
                    value={form.roblox.username}
                    onChange={(e) => updateRoblox({ username: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Display Name"
                    value={form.roblox.displayName}
                    onChange={(e) => updateRoblox({ displayName: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      style={inputStyle}
                      placeholder="User ID"
                      value={form.roblox.userId}
                      onChange={(e) => updateRoblox({ userId: e.target.value })}
                    />
                    {onFetchRobloxUser && (
                      <button
                        type="button"
                        disabled={robloxLoading}
                        onClick={async () => {
                          if (!form.roblox.userId) return;
                          setRobloxLoading(true);
                          try {
                            const data = await onFetchRobloxUser(form.roblox.userId);
                            if (data) {
                              updateRoblox({
                                username: data.username || form.roblox.username,
                                displayName: data.displayName || form.roblox.displayName,
                                avatarUrl: data.avatarUrl || form.roblox.avatarUrl,
                              });
                            } else {
                              alert("User not found. Check the ID.");
                            }
                          } finally {
                            setRobloxLoading(false);
                          }
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                          robloxLoading
                            ? "bg-[#e2231a]/20 text-[#e2231a] cursor-wait"
                            : "bg-white/5 hover:bg-[#e2231a]/20 text-zinc-300 hover:text-[#e2231a]"
                        }`}
                      >
                        {robloxLoading ? "Loading..." : "Auto-fill"}
                      </button>
                    )}
                  </div>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Avatar URL (optional)"
                    value={form.roblox.avatarUrl}
                    onChange={(e) => updateRoblox({ avatarUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Severity */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] mb-3">Severity</h3>
                <div className="flex flex-wrap gap-2">
                  {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((sev) => {
                    const cfg = SEVERITY_CONFIG[sev];
                    const isActive = form.moderation.severity === sev;
                    return (
                      <button
                        key={sev}
                        onClick={() => updateMod({ severity: sev })}
                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
                        style={{
                          background: isActive ? cfg.bg : "#0d0d0d",
                          color: isActive ? cfg.color : "#666",
                          border: `1px solid ${isActive ? cfg.color + "40" : "#1e1e1e"}`,
                          boxShadow: isActive ? `0 0 12px ${cfg.color}15` : "none",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {TAG_PRESETS.map((tag) => {
                    const isActive = form.moderation.tags.includes(tag);
                    const color = TAG_COLORS[tag] || "#666";
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                        style={{
                          background: isActive ? `${color}20` : "#0d0d0d",
                          color: isActive ? color : "#666",
                          border: `1px solid ${isActive ? `${color}40` : "#1e1e1e"}`,
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Custom tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                  />
                  <button
                    onClick={addCustomTag}
                    className="px-3 rounded-lg text-xs font-bold text-[#c0392b] hover:bg-[#c0392b]/10 transition-colors"
                    style={{ border: "1px solid #1e1e1e" }}
                  >
                    Add
                  </button>
                </div>
                {form.moderation.tags.filter((t) => !TAG_PRESETS.includes(t)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.moderation.tags
                      .filter((t) => !TAG_PRESETS.includes(t))
                      .map((tag) => (
                        <TagBadge key={tag} tag={tag} removable onRemove={() => toggleTag(tag)} />
                      ))}
                  </div>
                )}
              </div>

              {/* Reasons */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] mb-3">Reasons</h3>
                <div className="space-y-2">
                  {form.moderation.reasons.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea
                        className={`${inputCls} resize-none min-h-[60px]`}
                        style={inputStyle}
                        placeholder="Describe the reason for the ban..."
                        value={r}
                        onChange={(e) => {
                          const reasons = [...form.moderation.reasons];
                          reasons[i] = e.target.value;
                          updateMod({ reasons });
                        }}
                      />
                      {form.moderation.reasons.length > 1 && (
                        <button
                          onClick={() =>
                            updateMod({ reasons: form.moderation.reasons.filter((_, idx) => idx !== i) })
                          }
                          className="p-2 self-start rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <X className="w-4 h-4 text-[#c0392b]" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => updateMod({ reasons: [...form.moderation.reasons, ""] })}
                    className="text-xs font-semibold text-[#c0392b] hover:text-[#e74c3c] transition-colors"
                  >
                    + Add reason
                  </button>
                </div>
              </div>

              {/* Declaration PDF */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] mb-3">Declaration PDF URL</h3>
                <input
                  className={inputCls}
                  style={inputStyle}
                  placeholder="https://... (Link to PDF)"
                  value={form.moderation.declarationPdf || ""}
                  onChange={(e) => updateMod({ declarationPdf: e.target.value })}
                />
              </div>

              {/* Evidence */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#666] mb-3">Evidence Links</h3>
                <div className="space-y-2">
                  {form.moderation.evidence.map((e, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className={inputCls}
                        style={inputStyle}
                        placeholder="https://..."
                        value={e}
                        onChange={(ev) => {
                          const evidence = [...form.moderation.evidence];
                          evidence[i] = ev.target.value;
                          updateMod({ evidence });
                        }}
                      />
                      {form.moderation.evidence.length > 1 && (
                        <button
                          onClick={() =>
                            updateMod({ evidence: form.moderation.evidence.filter((_, idx) => idx !== i) })
                          }
                          className="p-2 self-start rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <X className="w-4 h-4 text-[#c0392b]" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => updateMod({ evidence: [...form.moderation.evidence, ""] })}
                    className="text-xs font-semibold text-[#c0392b] hover:text-[#e74c3c] transition-colors"
                  >
                    + Add evidence link
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-5" style={{ borderTop: "1px solid #1e1e1e" }}>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#666] hover:text-[#e8e8e8] hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #c0392b, #96281b)",
                  boxShadow: "0 4px 15px rgba(192,57,43,0.3)",
                }}
              >
                {isEdit ? "Save Changes" : "Add to Blacklist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate prompt */}
      {showDuplicatePrompt && duplicateUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowDuplicatePrompt(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ background: "#141414", border: "1px solid #1e1e1e" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#f39c12]" />
              <h3 className="text-base font-bold text-[#e8e8e8]">Duplicate Found</h3>
            </div>
            <p className="text-sm text-[#666] mb-6">
              A user matching <strong className="text-[#e8e8e8]">@{duplicateUser.discord.username || duplicateUser.roblox.username}</strong>{" "}
              already exists. Would you like to update their entry and move the old name to history?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDuplicatePrompt(false)}
                className="px-4 py-2 rounded-lg text-sm text-[#666] hover:text-[#e8e8e8] hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #f39c12, #d68910)",
                }}
              >
                Update & Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   DELETE CONFIRM
   ═══════════════════════════════════════════ */

function DeleteConfirm({
  user,
  onConfirm,
  onCancel,
}: {
  user: BlacklistUser;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{ background: "#141414", border: "1px solid #1e1e1e" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(192,57,43,0.15)" }}>
            <Trash2 className="w-5 h-5 text-[#c0392b]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#e8e8e8]">Remove User</h3>
            <p className="text-xs text-[#666]">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-[#666] mb-6">
          Are you sure you want to remove{" "}
          <strong className="text-[#e8e8e8]">@{user.discord.username || user.roblox.username}</strong>{" "}
          from the blacklist?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-[#666] hover:text-[#e8e8e8] hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #c0392b, #96281b)" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export function BlacklistClient({
  initialUsers,
  readOnly = false,
  onSaveUser,
  onDeleteUser,
  onFetchDiscordUser,
  onFetchRobloxUser,
}: {
  initialUsers?: BlacklistUser[];
  readOnly?: boolean;
  onSaveUser?: (user: BlacklistUser, isNew: boolean) => Promise<void>;
  onDeleteUser?: (id: string) => Promise<void>;
  onFetchDiscordUser?: (id: string) => Promise<any>;
  onFetchRobloxUser?: (id: string) => Promise<any>;
}) {
  const [users, setUsers] = useState<BlacklistUser[]>(initialUsers || []);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // Modals
  const [formUser, setFormUser] = useState<BlacklistUser | null | undefined>(undefined); // undefined = closed, null = new, user = edit
  const [detailUser, setDetailUser] = useState<BlacklistUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<BlacklistUser | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialUsers) {
      setUsers(loadData());
    } else {
      setUsers(initialUsers);
    }
    setMounted(true);
  }, [initialUsers]);

  useEffect(() => {
    if (mounted && !readOnly) saveData(users);
  }, [users, mounted, readOnly]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => {
      setShowFilters(false);
      setShowSort(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.discord.username.toLowerCase().includes(q) ||
          u.discord.userId.includes(q) ||
          u.roblox.username.toLowerCase().includes(q) ||
          u.roblox.displayName.toLowerCase().includes(q) ||
          u.roblox.userId.includes(q) ||
          u.moderation.tags.some((t) => t.toLowerCase().includes(q)) ||
          u.moderation.reasons.some((r) => r.toLowerCase().includes(q))
      );
    }
    if (severityFilter) {
      list = list.filter((u) => u.moderation.severity === severityFilter);
    }
    if (tagFilter) {
      list = list.filter((u) => u.moderation.tags.includes(tagFilter));
    }
    return list;
  }, [users, search, severityFilter, tagFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = new Date(a.moderation.addedAt).getTime() - new Date(b.moderation.addedAt).getTime();
          break;
        case "name":
          cmp = (a.discord.username || a.roblox.username).localeCompare(b.discord.username || b.roblox.username);
          break;
        case "communities":
          cmp = a.moderation.communities.length - b.moderation.communities.length;
          break;
        case "severity":
          cmp = SEVERITY_ORDER[a.moderation.severity] - SEVERITY_ORDER[b.moderation.severity];
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.moderation.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [users]);

  const handleSave = async (user: BlacklistUser, isNew: boolean) => {
    if (onSaveUser) {
      await onSaveUser(user, isNew);
      // Wait for server revalidation, or just optimistically update:
    }
    
    if (isNew) {
      setUsers((prev) => [user, ...prev]);
    } else {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    }
    setFormUser(undefined);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    if (onDeleteUser) {
      await onDeleteUser(deleteUser.id);
    }
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    setDeleteUser(null);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blacklist-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="w-8 h-8 border-2 border-[#c0392b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 ep-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.2)" }}
                >
                  <ShieldX className="w-5 h-5 text-[#c0392b]" />
                </div>
                <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-[var(--ep-text-primary)]">
                  Blacklist
                </h1>
              </div>
              <p className="text-sm text-[var(--ep-text-secondary)] max-w-lg">
                Public registry of banned users across Discord and Roblox communities. 
                View moderation records and name change history.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.15)" }}
              >
                <p className="text-2xl font-extrabold text-[#c0392b]">{users.length}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#666]">Blacklisted</p>
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="text"
                placeholder="Search by name, ID, or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[var(--ep-text-primary)] placeholder-[var(--ep-text-muted)] focus:outline-none focus:ring-1 focus:ring-[#c0392b]/40 transition-all duration-200"
                style={{ background: "var(--ep-bg-elevated)", border: "1px solid var(--ep-border)" }}
                id="blacklist-search"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/5"
                >
                  <X className="w-3.5 h-3.5 text-[#666]" />
                </button>
              )}
            </div>

            {/* Filter dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowSort(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: severityFilter || tagFilter ? "rgba(192,57,43,0.1)" : "var(--ep-bg-elevated)",
                  border: severityFilter || tagFilter ? "1px solid rgba(192,57,43,0.2)" : "1px solid var(--ep-border)",
                  color: severityFilter || tagFilter ? "#c0392b" : "var(--ep-text-secondary)",
                }}
                id="blacklist-filter-btn"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(severityFilter || tagFilter) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" />
                )}
              </button>
              {showFilters && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-30 overflow-hidden"
                  style={{ background: "#141414", border: "1px solid #1e1e1e" }}
                >
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-2">Severity</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((sev) => {
                          const cfg = SEVERITY_CONFIG[sev];
                          const isActive = severityFilter === sev;
                          return (
                            <button
                              key={sev}
                              onClick={() => setSeverityFilter(isActive ? null : sev)}
                              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors"
                              style={{
                                background: isActive ? cfg.bg : "#0d0d0d",
                                color: isActive ? cfg.color : "#666",
                                border: `1px solid ${isActive ? cfg.color + "40" : "#1e1e1e"}`,
                              }}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#666] mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {allTags.map((tag) => {
                          const isActive = tagFilter === tag;
                          const color = TAG_COLORS[tag] || "#666";
                          return (
                            <button
                              key={tag}
                              onClick={() => setTagFilter(isActive ? null : tag)}
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors"
                              style={{
                                background: isActive ? `${color}20` : "#0d0d0d",
                                color: isActive ? color : "#666",
                                border: `1px solid ${isActive ? `${color}40` : "#1e1e1e"}`,
                              }}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {(severityFilter || tagFilter) && (
                      <button
                        onClick={() => {
                          setSeverityFilter(null);
                          setTagFilter(null);
                        }}
                        className="w-full text-xs text-[#c0392b] hover:text-[#e74c3c] font-semibold py-2 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setShowSort(!showSort);
                  setShowFilters(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--ep-text-secondary)] transition-all duration-200"
                style={{ background: "var(--ep-bg-elevated)", border: "1px solid var(--ep-border)" }}
                id="blacklist-sort-btn"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>
              {showSort && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl z-30 overflow-hidden"
                  style={{ background: "#141414", border: "1px solid #1e1e1e" }}
                >
                  <div className="p-2">
                    {(
                      [
                        { field: "date", label: "Date Added" },
                        { field: "name", label: "Name" },

                        { field: "severity", label: "Severity" },
                      ] as { field: SortField; label: string }[]
                    ).map(({ field, label }) => (
                      <button
                        key={field}
                        onClick={() => {
                          if (sortField === field) {
                            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          } else {
                            setSortField(field);
                            setSortDir("desc");
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/[0.03]"
                        style={{ color: sortField === field ? "#c0392b" : "#666" }}
                      >
                        {label}
                        {sortField === field && (
                          <ChevronDown
                            className="w-3 h-3 transition-transform"
                            style={{ transform: sortDir === "asc" ? "rotate(180deg)" : "none" }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Import/Export (only if not readonly) */}
            {!readOnly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
                  style={{ border: "1px solid var(--ep-border)" }}
                  title="Export JSON"
                >
                  <Download className="w-4 h-4 text-[var(--ep-text-secondary)]" />
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
                  style={{ border: "1px solid var(--ep-border)" }}
                  title="Import JSON"
                >
                  <Upload className="w-4 h-4 text-[var(--ep-text-secondary)]" />
                </button>
                <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              </div>
            )}
          </div>

          {/* Result count */}
          {(search || severityFilter || tagFilter) && (
            <p className="text-xs text-[#666] mt-3">
              Showing <strong className="text-[var(--ep-text-primary)]">{sorted.length}</strong> of{" "}
              {users.length} results
            </p>
          )}
        </div>

        {/* Cards Grid */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 ep-fade-up">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.1)" }}
            >
              <Shield className="w-8 h-8 text-[#c0392b]/40" />
            </div>
            <p className="text-lg font-bold text-[var(--ep-text-primary)] mb-1">No users found</p>
            <p className="text-sm text-[#666]">
              {search || severityFilter || tagFilter
                ? "Try adjusting your search or filters."
                : "The blacklist is empty."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {sorted.map((user, i) => (
              <div key={user.id} className="ep-fade-up" style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}>
                <UserCard
                  user={user}
                  onView={() => setDetailUser(user)}
                  onEdit={readOnly ? undefined : () => setFormUser(user)}
                  onDelete={readOnly ? undefined : () => setDeleteUser(user)}
                  readOnly={readOnly}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB (only if not readonly) */}
      {!readOnly && (
        <button
          onClick={() => setFormUser(null)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 z-40"
          style={{
            background: "linear-gradient(135deg, #c0392b, #96281b)",
            boxShadow: "0 8px 30px rgba(192,57,43,0.4)",
          }}
          title="Add to blacklist"
          id="blacklist-add-btn"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modals */}
      {formUser !== undefined && (
        <FormModal
          initial={formUser}
          onSave={handleSave}
          onClose={() => setFormUser(undefined)}
          existingUsers={users}
          onFetchDiscordUser={onFetchDiscordUser}
          onFetchRobloxUser={onFetchRobloxUser}
        />
      )}

      {detailUser && (
        <DetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onEdit={readOnly ? undefined : () => {
            setFormUser(detailUser);
            setDetailUser(null);
          }}
          readOnly={readOnly}
        />
      )}

      {deleteUser && (
        <DeleteConfirm
          user={deleteUser}
          onConfirm={handleDelete}
          onCancel={() => setDeleteUser(null)}
        />
      )}
    </div>
  );
}
