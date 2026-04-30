"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ShieldAlert, Star, Shield, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/components/i18n-provider";
import { DiscordProfileCard } from "@/components/discord-profile-card";

const ROLE_MAP: Record<number, { labelKey: keyof ReturnType<typeof getRoleLabels>; icon: any; color: string; bg: string }> = {
  0: { labelKey: "owner", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  1: { labelKey: "staffManager", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
  2: { labelKey: "headAdmin", icon: ShieldCheck, color: "text-orange-400", bg: "bg-orange-500/10" },
  3: { labelKey: "admin", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
  4: { labelKey: "seniorModerator", icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  5: { labelKey: "moderator", icon: Users, color: "text-teal-400", bg: "bg-teal-500/10" },
};

function getRoleLabels() {
  return {
    owner: "",
    staffManager: "",
    headAdmin: "",
    admin: "",
    seniorModerator: "",
    moderator: "",
    staffTeam: "",
  };
}

const DEFAULT_ROLE = { labelKey: "staffTeam" as const, icon: Users, color: "text-[var(--ep-text-secondary)]", bg: "bg-white/5" };

export function TeamSections({ staff }: { staff: any[] }) {
  const { t } = useI18n();
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [selectedRoleConfig, setSelectedRoleConfig] = useState<{ color: string; label: string } | null>(null);

  const groups: Record<number, any[]> = {};
  staff.forEach((member) => {
    const groupId = member.order;
    if (!groups[groupId]) groups[groupId] = [];
    groups[groupId].push(member);
  });

  const sortedGroupIds = Object.keys(groups)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    sortedGroupIds.forEach((id, index) => {
      initial[id] = index !== 0;
    });
    return initial;
  });

  const toggleCollapse = (id: number) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openProfile = useCallback(
    (member: any, config: { labelKey: keyof ReturnType<typeof getRoleLabels>; icon: any; color: string; bg: string }) => {
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
      <div className="flex flex-col gap-6 w-full ep-fade-up" style={{ animationDelay: "100ms" }}>
        {sortedGroupIds.map((groupId, sIndex) => {
          const members = groups[groupId];
          const config = ROLE_MAP[groupId] || DEFAULT_ROLE;
          const Icon = config.icon;
          const isCollapsed = collapsedSections[groupId] ?? false;

          return (
            <section key={groupId} className="ep-fade-up flex flex-col w-full" style={{ animationDelay: `${sIndex * 80}ms` }}>
              {/* Section Header */}
              <button
                onClick={() => toggleCollapse(groupId)}
                className="w-full flex items-center gap-3 mb-6 group cursor-pointer"
              >
                <div className={`p-2 rounded-xl border border-[var(--ep-border)] transition-colors duration-200 group-hover:border-[var(--ep-border-accent)] ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-[var(--ep-text-primary)]">
                  {t.team.roles[config.labelKey]}
                </h2>
                <span className="text-xs font-bold text-[var(--ep-text-muted)] tabular-nums">
                  ({members.length})
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[var(--ep-border)] to-transparent" />
                <ChevronDown
                  className={`w-5 h-5 text-[var(--ep-text-muted)] group-hover:text-[var(--ep-text-secondary)] transition-all duration-300 ${
                    isCollapsed ? "" : "rotate-180"
                  }`}
                />
              </button>

              {/* Content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out w-full flex flex-col items-center ${
                  isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
                }`}
              >
                <div className="flex flex-wrap justify-center gap-4 lg:gap-6 w-full mb-4">
                  {members.map((member, index) => (
                    <div key={member.id} className="ep-fade-up w-full sm:w-[280px] lg:w-[320px]" style={{ animationDelay: `${(index + 1) * 50}ms` }}>
                      <DiscordProfileCard
                        member={member}
                        roleColor={config.color}
                        roleLabel={t.team.roles[config.labelKey] || member.role}
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
