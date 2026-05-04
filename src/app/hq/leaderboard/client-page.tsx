"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Trophy, Calendar, Download, X, Loader2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

type LeaderboardRow = {
  modId: string;
  modName: string;
  modRole: string;
  actionCount: number;
  points: number;
  breakdown: Record<string, number>;
};

export default function LeaderboardClient({
  leaderboard,
  initialDateRange,
}: {
  leaderboard: LeaderboardRow[];
  initialDateRange?: { from?: string; to?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dateFrom, setDateFrom] = useState(initialDateRange?.from || "");
  const [dateTo, setDateTo] = useState(initialDateRange?.to || "");
  const [exporting, setExporting] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (dateFrom) params.set("from", dateFrom);
    else params.delete("from");

    if (dateTo) params.set("to", dateTo);
    else params.delete("to");

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    router.push(pathname);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams(searchParams);
      const url = `/api/hq/export-leaderboard?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to export leaderboard");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Leaderboard_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      alert("Error exporting Excel file. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Header and Controls */}
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)] flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
            Staff <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--ep-accent)] to-yellow-400">Leaderboard</span>
          </h1>
          <p className="text-white/30 text-sm mt-1.5">
            Complete classification of moderators by points. 1 Action = 1 Point.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-xl border border-[var(--ep-border)]">
            <div className="flex items-center gap-2 px-2">
              <Calendar className="w-4 h-4 text-white/40" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent border-none text-sm text-white focus:outline-none w-32 [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
              />
              <span className="text-white/30 text-xs">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent border-none text-sm text-white focus:outline-none w-32 [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
              />
            </div>
            <div className="flex items-center gap-1 border-l border-[var(--ep-border)] pl-1.5">
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 rounded-lg bg-[var(--ep-accent)] text-black text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
              {(dateFrom || dateTo) && (
                <button
                  onClick={clearFilters}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors"
                  title="Clear Filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
            style={{
              
              color: "#fff",
              
            }}
          >
            {exporting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</span>
            ) : (
              <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Export Excel</span>
            )}
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card className=" overflow-hidden rounded-2xl border-[var(--ep-border)] bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-black/40 text-xs uppercase text-white/50">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider w-24 text-center">Rank</th>
                <th className="px-6 py-4 font-bold tracking-wider">Moderator</th>
                <th className="px-6 py-4 font-bold tracking-wider">Role</th>
                <th className="px-6 py-4 font-bold tracking-wider w-[40%]">Action Breakdown</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right text-[var(--ep-accent)]">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                    No data found for the selected period.
                  </td>
                </tr>
              ) : (
                leaderboard.map((mod, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <tr 
                      key={mod.modId} 
                      className={`hover:bg-white/[0.03] transition-colors ${isTop3 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <td className="px-6 py-4 text-center">
                        {rank === 1 ? (
                          <div className="mx-auto w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                          </div>
                        ) : rank === 2 ? (
                          <div className="mx-auto w-8 h-8 rounded-full bg-gray-300/20 flex items-center justify-center border border-gray-300/50">
                            <Trophy className="w-4 h-4 text-gray-300" />
                          </div>
                        ) : rank === 3 ? (
                          <div className="mx-auto w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center border border-amber-600/50">
                            <Trophy className="w-4 h-4 text-amber-500" />
                          </div>
                        ) : (
                          <span className="text-white/40 font-bold">{rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-base">
                        {mod.modName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70">
                          {mod.modRole}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(mod.breakdown).map(([type, count]) => (
                            <span key={type} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.04] border border-white/[0.08] text-white/60">
                              {type.replace(/_/g, ' ')}: <span className="text-white">{count}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-mono text-white/70">
                        {mod.actionCount}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums">
                        <div className="flex items-center justify-end gap-1.5 font-bold text-lg text-[var(--ep-accent)] drop-shadow-[0_0_8px_rgba(232,164,74,0.3)]">
                          <Star className="w-4 h-4 fill-current" />
                          {mod.points}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
