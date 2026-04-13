"use client";

import { useState } from "react";
import { ChevronDown, ShieldAlert, Star, Shield, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_MAP: Record<number, { label: string; icon: any; color: string; bg: string }> = {
  0: { label: "Owner", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  1: { label: "Staff Manager", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
  2: { label: "Head Admin", icon: ShieldCheck, color: "text-orange-400", bg: "bg-orange-500/10" },
  3: { label: "Admin", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10" },
  4: { label: "Senior Moderator", icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  5: { label: "Moderator", icon: Users, color: "text-[#7ca982]", bg: "bg-[#7ca982]/10" },
};

const DEFAULT_ROLE = { label: "Staff Team", icon: Users, color: "text-zinc-400", bg: "bg-white/5" };

export function TeamSections({ staff }: { staff: any[] }) {
  // Group staff by their order definition
  const groups: Record<number, any[]> = {};
  staff.forEach((member) => {
    const groupId = member.order;
    if (!groups[groupId]) groups[groupId] = [];
    groups[groupId].push(member);
  });

  // Extract and sort the groups present
  const sortedGroupIds = Object.keys(groups)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  // Default collapse state: only first group expanded
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    sortedGroupIds.forEach((id, index) => {
      initial[id] = index !== 0; // true (collapsed) if not the very first group
    });
    return initial;
  });

  const toggleCollapse = (id: number) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (staff.length === 0) {
    return (
      <div className="w-full min-h-[300px] glass-card border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-500 gap-5 animate-fade-in-up">
        <div className="relative">
          <Users className="w-16 h-16 text-zinc-700 animate-float" />
          <div className="absolute inset-0 bg-[#a67c52]/10 blur-2xl rounded-full" />
        </div>
        <span className="text-xl font-medium uppercase tracking-widest">Team Coming Soon</span>
        <p className="text-zinc-600 text-sm">Staff members will be listed here shortly.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      {sortedGroupIds.map((groupId, sIndex) => {
        const members = groups[groupId];
        const config = ROLE_MAP[groupId] || DEFAULT_ROLE;
        const Icon = config.icon;
        const isCollapsed = collapsedSections[groupId] ?? false;

        return (
          <section key={groupId} className="animate-fade-in-up flex flex-col w-full" style={{ animationDelay: `${sIndex * 80}ms` }}>
            {/* Collapsible Section Header */}
            <button
              onClick={() => toggleCollapse(groupId)}
              className="w-full flex items-center gap-3 mb-6 group cursor-pointer"
            >
              <div className={`p-2 rounded-xl border border-white/5 transition-colors duration-200 group-hover:border-white/10 ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                {config.label}
              </h2>
              <span className="text-xs font-bold text-zinc-600 tabular-nums">
                ({members.length})
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-all duration-300 ${
                  isCollapsed ? "" : "rotate-180"
                }`}
              />
            </button>

            {/* Collapsible Content */}
            <div
              className={`overflow-hidden transition-all duration-400 ease-in-out w-full flex flex-col items-center ${
                isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
              }`}
            >
              <div className="flex flex-wrap justify-center gap-3 lg:gap-4 w-full mb-4">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="group glass-card rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-[#a67c52]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#a67c52]/5 animate-fade-in-up text-center w-full sm:w-[200px] lg:w-[220px]"
                    style={{ animationDelay: `${(index + 1) * 60}ms` }}
                  >
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2 border-zinc-800 group-hover:border-[#a67c52]/50 transition-all duration-300 shadow-xl">
                        <AvatarImage src={member.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-[#a67c52]/30 to-[#7ca982]/30 text-zinc-200 font-black text-xl">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-[#a67c52]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex flex-col items-center min-w-0 px-2 w-full">
                      <span className="font-bold text-base text-zinc-100 group-hover:text-white transition-colors duration-300 truncate w-full">
                        {member.name}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#a67c52] mt-0.5 truncate w-full text-center">
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
