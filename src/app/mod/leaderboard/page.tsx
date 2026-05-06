"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Search, Star, Target, Shield } from "lucide-react";
import { getModLeaderboardData } from "@/app/mod/shift-actions";

type LeaderboardMod = {
  modId: string;
  modName: string;
  modRole: string;
  actionCount: number;
  points: number;
  breakdown: Record<string, number>;
};

export default function ModLeaderboardPage() {
  const [data, setData] = useState<LeaderboardMod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModLeaderboardData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)] flex items-start justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
            Staff <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">Leaderboard</span>
          </h1>
          <p className="text-white/30 text-sm mt-1.5">
            View the top performing moderators based on moderation actions taken.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/30 text-sm">Loading leaderboard...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] rounded-xl border border-white/5">
          <Trophy className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/20 text-sm">No moderation data available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((mod, index) => {
            let rankColor = "text-zinc-500";
            let rankBg = "bg-white/[0.03]";
            
            if (index === 0) {
              rankColor = "text-yellow-400";
              rankBg = "bg-yellow-400/[0.1]";
            } else if (index === 1) {
              rankColor = "text-zinc-300";
              rankBg = "bg-zinc-300/[0.1]";
            } else if (index === 2) {
              rankColor = "text-amber-600";
              rankBg = "bg-amber-600/[0.1]";
            }

            return (
              <div 
                key={mod.modId} 
                className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center gap-4 transition-all hover:scale-[1.01] ${index < 3 ? 'border-white/10' : 'border-white/5'}`}
                style={{
                  background: index < 3 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)"
                }}
              >
                {/* Rank Badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${rankBg}`}>
                  {index < 3 ? (
                    <Trophy className={`w-6 h-6 ${rankColor}`} />
                  ) : (
                    <span className="text-lg font-bold text-white/40">#{index + 1}</span>
                  )}
                </div>

                {/* Mod Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-white truncate">{mod.modName}</span>
                    {index === 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400">
                        Top Mod
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      {mod.modRole}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-blue-400/60" />
                      {mod.actionCount} total actions
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="flex items-end flex-col md:items-center md:flex-row gap-3 mt-4 md:mt-0">
                  <div className="px-4 py-2 rounded-lg bg-black/30 border border-white/5 flex flex-col items-center min-w-[100px]">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-0.5">Points</span>
                    <span className={`text-2xl font-black tabular-nums ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                      {mod.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
