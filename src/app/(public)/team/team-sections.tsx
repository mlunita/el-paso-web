"use client";

import { useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { ShieldAlert, Star, Shield, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { DiscordProfileCard } from "@/components/discord-profile-card";

type RoleLabelKey = "owner" | "staffManager" | "headAdmin" | "admin" | "seniorModerator" | "moderator" | "staffTeam";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  image?: string | null;
  discordId?: string | null;
  order: number;
  createdAt?: string;
}

interface RoleConfig {
  labelKey: RoleLabelKey;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const ROLE_MAP: Record<number, RoleConfig> = {
  0: { labelKey: "owner", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  1: { labelKey: "staffManager", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
  2: { labelKey: "headAdmin", icon: ShieldCheck, color: "text-orange-400", bg: "bg-orange-500/10" },
  3: { labelKey: "admin", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
  4: { labelKey: "seniorModerator", icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  5: { labelKey: "moderator", icon: Users, color: "text-teal-400", bg: "bg-teal-500/10" },
};

const DEFAULT_ROLE: RoleConfig = { labelKey: "staffTeam", icon: Users, color: "text-[var(--ep-text-secondary)]", bg: "bg-white/5" };

export function TeamSections({ staff }: { staff: StaffMember[] }) {
  const { t } = useI18n();
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [selectedRoleConfig, setSelectedRoleConfig] = useState<{ color: string; label: string } | null>(null);

  const groups: Record<number, StaffMember[]> = {};
  staff.forEach((member) => {
    const groupId = member.order;
    if (!groups[groupId]) groups[groupId] = [];
    groups[groupId].push(member);
  });

  const sortedGroupIds = Object.keys(groups)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  const openProfile = useCallback(
    (member: StaffMember, config: RoleConfig) => {
      setSelectedMember({
        ...member,
        createdAt: member.createdAt?.toString?.() ?? member.createdAt,
      });
      setSelectedRoleConfig({
        color: config.color,
        label: t.team.roles[config.labelKey] || member.role,
      });
    },
    [t]
  );

  const closeProfile = useCallback(() => {
    setSelectedMember(null);
    setSelectedRoleConfig(null);
  }, []);

  if (staff.length === 0) {
    return (
      <div className="ep-card rounded-2xl border-dashed min-h-[300px] flex flex-col items-center justify-center text-[var(--ep-text-muted)] gap-5 ep-fade-up">
        <div className="relative">
          <Users className="w-14 h-14 text-[var(--ep-text-muted)] ep-float" />
          <div className="absolute inset-0 bg-[var(--ep-accent)]/10 blur-2xl rounded-full" />
        </div>
        <span className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-widest">{t.team.comingSoon}</span>
        <p className="text-sm">{t.team.comingSoonSub}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full flex-col gap-7 ep-fade-up" style={{ animationDelay: "100ms" }}>
        {sortedGroupIds.map((groupId, sIndex) => {
          const members = groups[groupId];
          const config = ROLE_MAP[groupId] || DEFAULT_ROLE;
          const Icon = config.icon;

          return (
            <section key={groupId} className="ep-fade-up flex w-full flex-col" style={{ animationDelay: `${sIndex * 80}ms` }}>
              <div className="mb-3 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                <div className="h-px bg-gradient-to-r from-transparent to-[var(--ep-border)]" aria-hidden="true" />
                <div className="flex items-center justify-center gap-2 px-2">
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} aria-hidden="true" />
                  <h2 className={`font-[family-name:var(--font-heading)] text-xs sm:text-sm font-extrabold uppercase tracking-[0.22em] ${config.color}`}>
                    {t.team.roles[config.labelKey]}
                  </h2>
                  <span className="rounded-full border border-[var(--ep-border)] bg-[var(--ep-bg-surface)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--ep-text-muted)]">
                    {members.length}
                  </span>
                </div>
                <div className="h-px bg-gradient-to-l from-transparent to-[var(--ep-border)]" aria-hidden="true" />
              </div>

              <div className="flex w-full flex-col items-center">
                <div className="mb-1 flex w-full flex-wrap justify-center gap-2 sm:gap-2.5 lg:gap-3">
                  {members.map((member, index) => (
                    <div key={member.id} className="ep-fade-up w-full max-w-[174px] sm:w-[158px] md:w-[160px] lg:w-[174px]" style={{ animationDelay: `${(index + 1) * 50}ms` }}>
                      <DiscordProfileCard
                        member={member}
                        roleColor={config.color}
                        roleLabel={t.team.roles[config.labelKey] || member.role}
                        compact
                        onClick={() => openProfile(member, config)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Discord Profile Modal */}
      {selectedMember && (
        <DiscordProfileCard
          isModal
          member={selectedMember}
          onClose={closeProfile}
          roleColor={selectedRoleConfig?.color}
          roleLabel={selectedRoleConfig?.label}
        />
      )}
    </>
  );
}
