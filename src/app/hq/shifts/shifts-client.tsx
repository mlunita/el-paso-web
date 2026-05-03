"use client";

import { useState, useTransition } from "react";
import {
  Clock, Users, Timer, Square, XCircle, Edit3,
  AlertTriangle, ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { adminForceClockOut, adminCancelShift } from "@/app/hq/moderation-actions";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SHIFT_TYPE_LABELS: Record<string, string> = {
  REGULAR: "Regular", TRAINING: "Training", EVENT: "Event",
  EMERGENCY: "Emergency", OVERTIME: "Overtime",
};

const SHIFT_TYPE_COLORS: Record<string, string> = {
  REGULAR: "#4ecdc4", TRAINING: "#f59e0b", EVENT: "#8b5cf6",
  EMERGENCY: "#ef4444", OVERTIME: "#e8a44a",
};

type ShiftData = {
  id: string; status: string; shiftType: string;
  modName: string; modId: string; modRole: string;
  clockIn: string; clockOut: string | null;
  totalSeconds: number; breakSeconds: number;
  notes: string | null; adminNotes: string | null; editedBy: string | null;
  breaks: { id: string; startedAt: string; endedAt: string | null; duration: number; reason: string | null }[];
};

export default function ShiftsClient({
  activeShifts,
  recentShifts,
  uniqueMods,
}: {
  activeShifts: ShiftData[];
  recentShifts: ShiftData[];
  uniqueMods: { modId: string; modName: string }[];
}) {
  const [filterMod, setFilterMod] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredHistory = filterMod
    ? recentShifts.filter((s) => s.modId === filterMod)
    : recentShifts;

  const handleForceClockOut = (shiftId: string) => {
    if (!confirm("Force clock out this moderator?")) return;
    startTransition(async () => {
      await adminForceClockOut(shiftId);
      window.location.reload();
    });
  };

  const handleCancel = (shiftId: string) => {
    if (!confirm("Cancel this shift? This cannot be undone.")) return;
    startTransition(async () => {
      await adminCancelShift(shiftId);
      window.location.reload();
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          Shift{" "}
          <span className="text-white/20 font-medium text-lg ml-2">Management</span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          Track active staff, review shift history, and manage time records.
        </p>
      </div>

      {/* Active Staff Panel */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" /> Active Staff ({activeShifts.length})
        </h2>

        {activeShifts.length === 0 ? (
          <div className="p-8 rounded-xl bg-white/[0.03] border border-[var(--ep-border)] text-center">
            <Clock className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/20 text-sm">No staff currently on shift.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeShifts.map((shift, i) => {
              const color = SHIFT_TYPE_COLORS[shift.shiftType] || "#4ecdc4";
              const elapsed = Math.floor((Date.now() - new Date(shift.clockIn).getTime()) / 1000);

              return (
                <Card
                  key={shift.id}
                  className="ep-card-enter relative overflow-hidden rounded-2xl p-0 border-0"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`,
                    border: `1px solid ${color}25`,
                  }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: shift.status === "PAUSED" ? "#f59e0b" : "#22c55e",
                            boxShadow: `0 0 8px ${shift.status === "PAUSED" ? "rgba(245,158,11,0.4)" : "rgba(34,197,94,0.4)"}`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white">{shift.modName}</span>
                      <span className="text-[10px] text-white/30 ml-auto">{shift.modRole}</span>
                    </div>

                    <div className="text-center mb-3">
                      <div className="text-3xl font-extrabold tabular-nums text-white">
                        {formatDuration(elapsed)}
                      </div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider">
                        {SHIFT_TYPE_LABELS[shift.shiftType]} · {shift.status === "PAUSED" ? "On Break" : "Active"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleForceClockOut(shift.id)}
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                      >
                        <Square className="w-3 h-3" /> Force Out
                      </button>
                      <button
                        onClick={() => handleCancel(shift.id)}
                        disabled={isPending}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Shift History */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <Timer className="w-4 h-4" /> Shift History
          </h2>
          <div className="ml-auto relative">
            <select
              value={filterMod}
              onChange={(e) => setFilterMod(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 rounded-lg bg-white/[0.05] border border-[var(--ep-border)] text-white text-xs focus:outline-none"
            >
              <option value="" className="bg-[#12151a]">All Moderators</option>
              {uniqueMods.map((m) => (
                <option key={m.modId} value={m.modId} className="bg-[#12151a]">
                  {m.modName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)]">
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Moderator</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Type</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Clock In</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Clock Out</th>
                <th className="text-right text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Work Time</th>
                <th className="text-right text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Breaks</th>
                <th className="text-center text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((shift, i) => (
                <tr
                  key={shift.id}
                  className="ep-card-enter border-b border-[var(--ep-border)] last:border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-white">{shift.modName}</div>
                    <div className="text-[10px] text-white/30">{shift.modRole}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{
                        background: `${SHIFT_TYPE_COLORS[shift.shiftType] || "#4ecdc4"}15`,
                        color: SHIFT_TYPE_COLORS[shift.shiftType] || "#4ecdc4",
                      }}
                    >
                      {SHIFT_TYPE_LABELS[shift.shiftType] || shift.shiftType}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-white/50 text-xs">{formatDate(shift.clockIn)}</td>
                  <td className="py-3 pr-4 text-white/50 text-xs">
                    {shift.clockOut ? formatDate(shift.clockOut) : "—"}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-white tabular-nums">
                    {formatDuration(Math.max(0, shift.totalSeconds - shift.breakSeconds))}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-white/40 tabular-nums text-xs">
                    {shift.breakSeconds > 0 ? formatDuration(shift.breakSeconds) : "—"}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background:
                          shift.status === "COMPLETED" ? "rgba(34,197,94,0.15)" :
                          shift.status === "CANCELLED" ? "rgba(239,68,68,0.15)" :
                          shift.status === "ACTIVE" ? "rgba(78,205,196,0.15)" :
                          "rgba(245,158,11,0.15)",
                        color:
                          shift.status === "COMPLETED" ? "#22c55e" :
                          shift.status === "CANCELLED" ? "#ef4444" :
                          shift.status === "ACTIVE" ? "#4ecdc4" :
                          "#f59e0b",
                      }}
                    >
                      {shift.status}
                    </span>
                    {shift.editedBy && (
                      <Edit3 className="w-3 h-3 text-yellow-400/50 inline ml-1" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12 text-white/20 text-sm">No shifts found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
