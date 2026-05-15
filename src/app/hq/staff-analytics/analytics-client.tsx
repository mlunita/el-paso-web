"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3, Users, Clock, ClipboardList, TrendingUp, TrendingDown,
  AlertTriangle, Shield, Trophy, Zap, Activity, Search,
  ArrowUpRight, ArrowDownRight, Minus, Calendar, Download, X, Loader2,
  Trash2, DatabaseBackup
} from "lucide-react";
import { adminDeleteAllStaffData } from "@/app/hq/moderation-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from "recharts";

const CHART_COLORS = ["#e8a44a", "#4ecdc4", "#ef4444", "#22c55e", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

type AnalyticsData = {
  overview: {
    totalShifts: number; completedShifts: number; activeShifts: number;
    totalActions: number; unreviewedActions: number;
    totalLookups: number; totalBanRequests: number;
  };
  moderators: {
    modId: string; modName: string; modRole: string;
    shiftCount: number; totalSeconds: number; breakSeconds: number; actionCount: number;
  }[];
  actionTypeBreakdown: { type: string; count: number }[];
  shiftTypeBreakdown: { type: string; count: number; totalHours: number }[];
  dailyData: { date: string; shifts: number; actions: number; hours: number }[];
  anomalies: string[];
  inactiveMods: { modId: string; modName: string }[];
  predictions: {
    shiftTrend: number; actionTrend: number;
    estimatedNextWeekShifts: number; estimatedNextWeekActions: number;
  };
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  BAN_REQUEST: "Ban Request", MODLOG: "Mod Log", TICKET: "Ticket",
  CHEATER_BAN: "Cheater Ban", WARNING: "Warning", KICK: "Kick",
  APPEAL_REVIEW: "Appeal", STAFF_NOTE: "Staff Note",
  CASE_REVIEW: "Case Review", INTERNAL_ESCALATION: "Escalation",
  CUSTOM: "Custom",
};

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-400" />;
  if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-white/30" />;
}

export default function StaffAnalyticsClient({
  analytics,
  initialDateRange,
}: {
  analytics: AnalyticsData;
  initialDateRange?: { from?: string; to?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dateFrom, setDateFrom] = useState(initialDateRange?.from || "");
  const [dateTo, setDateTo] = useState(initialDateRange?.to || "");
  const [exporting, setExporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { overview, moderators, actionTypeBreakdown, shiftTypeBreakdown, dailyData, anomalies, inactiveMods, predictions } = analytics;

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
      const url = `/api/hq/export-analytics?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to export analytics");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Staff_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`;
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

  // Sort leaderboards
  const byTime = [...moderators].sort((a, b) => (b.totalSeconds - b.breakSeconds) - (a.totalSeconds - a.breakSeconds));
  const byActions = [...moderators].sort((a, b) => b.actionCount - a.actionCount);
  const byShifts = [...moderators].sort((a, b) => b.shiftCount - a.shiftCount);

  return (
    <div>
      {/* Header and Controls */}
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)] flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
            Staff Analytics{" "}
            <span className="text-white/20 font-medium text-lg ml-2">Performance & Insights</span>
          </h1>
          <p className="text-white/30 text-sm mt-1.5">
            Comprehensive analytics, leaderboards, and predictions based on real data.
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
                className="px-3 py-1.5 rounded-lg bg-[var(--ep-secondary)] text-black text-xs font-bold hover:opacity-90 transition-opacity"
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

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Shifts", value: overview.totalShifts, icon: Clock, gradient: "linear-gradient(135deg, #4ecdc4 0%, #36b3aa 100%)", shadow: "rgba(78,205,196,0.3)" },
          { label: "Total Actions", value: overview.totalActions, icon: ClipboardList, gradient: "linear-gradient(135deg, #e8a44a 0%, #c4882e 100%)", shadow: "rgba(232,164,74,0.3)" },
          { label: "Active Staff", value: overview.activeShifts, icon: Users, gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", shadow: "rgba(34,197,94,0.3)" },
          { label: "Unreviewed", value: overview.unreviewedActions, icon: AlertTriangle, gradient: overview.unreviewedActions > 10 ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", shadow: overview.unreviewedActions > 10 ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className=" group relative border-0 text-white p-0 rounded-2xl overflow-hidden"
              
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 p-5 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-transform group-hover:scale-110" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Icon className="w-5 h-5 text-white/90" />
                </div>
                <div className="text-3xl font-extrabold tabular-nums">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{stat.label}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Predictions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Shift Trend", value: predictions.shiftTrend, suffix: "%" },
          { label: "Action Trend", value: predictions.actionTrend, suffix: "%" },
          { label: "Est. Next Week Shifts", value: predictions.estimatedNextWeekShifts, suffix: "" },
          { label: "Est. Next Week Actions", value: predictions.estimatedNextWeekActions, suffix: "" },
        ].map((pred) => (
          <div key={pred.label} className="p-4 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
            <div className="flex items-center gap-2 mb-1">
              <TrendIcon value={pred.value} />
              <span className="text-lg font-bold tabular-nums text-white">
                {pred.value > 0 ? "+" : ""}{pred.value}{pred.suffix}
              </span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/30">{pred.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Timeline */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 7-Day Activity
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="shiftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ecdc4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8a44a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8a44a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#12151a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, color: "#fff" }}
                  labelStyle={{ color: "rgba(255,255,255,0.4)" }}
                />
                <Area type="monotone" dataKey="shifts" stroke="#4ecdc4" fill="url(#shiftGrad)" strokeWidth={2} name="Shifts" />
                <Area type="monotone" dataKey="actions" stroke="#e8a44a" fill="url(#actionGrad)" strokeWidth={2} name="Actions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Type Breakdown */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Action Types
          </h3>
          {actionTypeBreakdown.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">No data yet.</p>
          ) : (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionTypeBreakdown.map((a) => ({ ...a, type: ACTION_TYPE_LABELS[a.type] || a.type }))}>
                  <XAxis dataKey="type" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#12151a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, color: "#fff" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Count">
                    {actionTypeBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top by Time */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--ep-accent)]" /> Top by Time
          </h3>
          {byTime.length === 0 ? (
            <p className="text-white/20 text-sm">No data.</p>
          ) : (
            <div className="space-y-2">
              {byTime.slice(0, 10).map((mod, i) => (
                <div key={mod.modId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span className={`w-6 text-center text-sm font-bold ${i < 3 ? "text-[var(--ep-accent)]" : "text-white/20"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{mod.modName}</div>
                    <div className="text-[10px] text-white/30">{mod.modRole}</div>
                  </div>
                  <span className="text-sm font-mono text-[var(--ep-accent)] tabular-nums">
                    {formatHours(mod.totalSeconds - mod.breakSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top by Actions */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--ep-secondary)]" /> Top by Actions
          </h3>
          {byActions.length === 0 ? (
            <p className="text-white/20 text-sm">No data.</p>
          ) : (
            <div className="space-y-2">
              {byActions.slice(0, 10).map((mod, i) => (
                <div key={mod.modId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span className={`w-6 text-center text-sm font-bold ${i < 3 ? "text-[var(--ep-secondary)]" : "text-white/20"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{mod.modName}</div>
                    <div className="text-[10px] text-white/30">{mod.modRole}</div>
                  </div>
                  <span className="text-sm font-mono text-[var(--ep-secondary)] tabular-nums">
                    {mod.actionCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top by Shifts */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" /> Top by Shifts
          </h3>
          {byShifts.length === 0 ? (
            <p className="text-white/20 text-sm">No data.</p>
          ) : (
            <div className="space-y-2">
              {byShifts.slice(0, 10).map((mod, i) => (
                <div key={mod.modId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span className={`w-6 text-center text-sm font-bold ${i < 3 ? "text-green-400" : "text-white/20"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{mod.modName}</div>
                    <div className="text-[10px] text-white/30">{mod.modRole}</div>
                  </div>
                  <span className="text-sm font-mono text-green-400 tabular-nums">
                    {mod.shiftCount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomalies */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)] flex flex-col max-h-[350px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-yellow-400" /> Anomalies & Alerts
          </h3>
          <div className="overflow-y-auto pr-2 space-y-2">
            {anomalies.length === 0 ? (
              <p className="text-white/20 text-sm">No anomalies detected. ✓</p>
            ) : (
              anomalies.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/[0.06] border border-yellow-500/10">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-white/60">{a}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inactive Mods */}
        <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)] flex flex-col max-h-[350px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2 shrink-0">
            <Shield className="w-4 h-4 text-red-400" /> Inactive Moderators (14d)
          </h3>
          <div className="overflow-y-auto pr-2 space-y-2">
            {inactiveMods.length === 0 ? (
              <p className="text-white/20 text-sm">All active moderators have recent shifts. ✓</p>
            ) : (
              inactiveMods.map((m) => (
                <div key={m.modId} className="flex items-center gap-2 p-3 rounded-lg bg-red-500/[0.06] border border-red-500/10">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-sm text-white/60 truncate">{m.modName}</span>
                  <span className="text-[10px] text-white/20 ml-auto shrink-0">No shifts in 14 days</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-[var(--ep-border)]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-5 flex items-center gap-2">
          <DatabaseBackup className="w-4 h-4" /> Staff Data Management
        </h3>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Download All Data */}
          <button
            onClick={async () => {
              try {
                setExportingAll(true);
                const res = await fetch("/api/hq/export-staff-data");
                if (!res.ok) throw new Error("Failed to export");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Staff_Data_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch {
                alert("Error downloading staff data.");
              } finally {
                setExportingAll(false);
              }
            }}
            disabled={exportingAll}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
          >
            {exportingAll ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
            ) : (
              <><Download className="w-4 h-4" /> Download All Staff Data</>
            )}
          </button>

          {/* Delete All Data */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete All Staff Data
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#12151a] border border-red-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-300">Delete All Staff Data</h3>
                  <p className="text-xs text-red-300/60">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-white/60 mb-4">
                This will permanently delete <strong className="text-white">all mod actions, shifts, ban requests, lookups, and their audit logs</strong>. 
                Download a backup first if needed.
              </p>

              <div className="mb-4">
                <label className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1.5 block">
                  Type <span className="text-red-400 font-mono">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setDeleting(true);
                      await adminDeleteAllStaffData();
                      setShowDeleteModal(false);
                      setDeleteConfirmText("");
                      router.refresh();
                    } catch {
                      alert("Error deleting staff data.");
                    } finally {
                      setDeleting(false);
                    }
                  }}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</span>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
