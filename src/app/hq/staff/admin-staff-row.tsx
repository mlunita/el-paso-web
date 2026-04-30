"use client";

import { useState, useEffect } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { DeleteStaffAction } from "./client-actions";
import { useI18n } from "@/components/i18n-provider";

interface DiscordApiUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
}

export function AdminStaffRow({ member }: { member: any }) {
  const { t } = useI18n();
  const [liveData, setLiveData] = useState<DiscordApiUser | null>(null);
  const [loading, setLoading] = useState(!!member.discordId);

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
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [member.discordId]);

  // Display name: live API > DB cached > DB name > fallback
  const displayName =
    liveData?.global_name ||
    liveData?.username ||
    member.discordDisplayName ||
    member.discordUsername ||
    (member.name !== "Discord User" ? member.name : "Unknown User");

  // Avatar URL: live API > DB cached > DB image > none
  const avatarUrl = (() => {
    if (liveData?.avatar && member.discordId) {
      const ext = liveData.avatar.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/avatars/${member.discordId}/${liveData.avatar}.${ext}?size=64`;
    }
    if (member.discordAvatar && member.discordId) {
      const ext = member.discordAvatar.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/avatars/${member.discordId}/${member.discordAvatar}.${ext}?size=64`;
    }
    return member.image || "";
  })();

  const discordHandle = liveData?.username
    ? `@${liveData.username}`
    : member.discordUsername
      ? `@${member.discordUsername}`
      : null;

  return (
    <TableRow className="border-white/10 hover:bg-white/5">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className={`border border-white/20 ${loading ? "animate-pulse bg-white/10" : ""}`}>
            {!loading && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="bg-gradient-to-br from-[#5865F2] to-[#7289DA] text-white text-xs font-bold">
              {displayName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className={`font-bold ${loading ? "text-white/30 animate-pulse" : ""}`}>
              {loading ? "Loading..." : displayName}
            </span>
            {discordHandle && !loading && (
              <span className="text-xs text-white/40">{discordHandle}</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-[var(--ep-accent)] font-medium">{member.role}</TableCell>
      <TableCell>
        {member.discordId ? (
          <a
            href={`https://discord.com/users/${member.discordId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[var(--ep-secondary)] hover:text-[var(--ep-accent)] transition-colors duration-200 underline underline-offset-2 decoration-white/10 hover:decoration-[var(--ep-accent)]/40"
          >
            {member.discordId}
          </a>
        ) : (
          <span className="text-white/20 text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Link href={`/hq/staff/edit/${member.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm">
            {t.common.edit}
          </Link>
          <DeleteStaffAction id={member.id} />
        </div>
      </TableCell>
    </TableRow>
  );
}
