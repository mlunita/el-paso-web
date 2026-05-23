"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Clock, Users, Timer, Square, XCircle, Edit3,
  AlertTriangle, ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { adminForceClockOut, adminCancelShift, adminEditShift } from "@/app/hq/moderation-actions";

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
  const [now, setNow] = useState(Date.now());

  const [editingShift, setEditingShift] = useState<ShiftData | null>(null);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await adminEditShift(null, formData);
      if (res?.error) {
        setEditError(res.error);
      } else {
        setEditingShift(null);
        window.location.reload();
      }
    });
  };

  const formatForInput = (d: string | null) => {
    if (!d) return "";
    const date = new Date(d);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
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
              
              const totalElapsed = Math.floor((now - new Date(shift.clockIn).getTime()) / 1000);
              let openBreakSeconds = 0;
              const openBreak = shift.breaks?.find((b) => !b.endedAt);
              if (openBreak) {
                openBreakSeconds = Math.floor((now - new Date(openBreak.startedAt).getTime()) / 1000);
              }
              const elapsed = Math.max(0, totalElapsed - (shift.breakSeconds || 0) - openBreakSeconds);

              return (
                <Card
                  key={shift.id}
                  className=" relative overflow-hidden rounded-2xl p-0 border-0"
                  
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: shift.status === "PAUSED" ? "#f59e0b" : "#22c55e",
                            
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
                <th className="text-right text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((shift, i) => (
                <tr
                  key={shift.id}
                  className=" border-b border-[var(--ep-border)] last:border-0 hover:bg-white/[0.02] transition-colors"
                  
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
                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={() => {
                        setEditError("");
                        setEditingShift(shift);
                      }}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      title="Edit Shift"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
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

      {/* Edit Modal */}
      {editingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12151a] border border-[var(--ep-border)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[var(--ep-border)] flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Edit Shift</h3>
              <button
                onClick={() => setEditingShift(null)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 flex flex-col gap-4">
              <input type="hidden" name="shiftId" value={editingShift.id} />
              
              {editError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase">Clock In</label>
                  <input
                    type="datetime-local"
                    name="clockIn"
                    defaultValue={formatForInput(editingShift.clockIn)}
                    required
                    className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase">Clock Out</label>
                  <input
                    type="datetime-local"
                    name="clockOut"
                    defaultValue={formatForInput(editingShift.clockOut)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-white/50 uppercase">Shift Type</label>
                  <select
                    name="shiftType"
                    defaultValue={editingShift.shiftType}
                    className="appearance-none px-3 py-2 rounded-lg bg-white/5 border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
                  >
                    {Object.keys(SHIFT_TYPE_LABELS).map((type) => (
                      <option key={type} value={type} className="bg-[#12151a]">{SHIFT_TYPE_LABELS[type]}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 bottom-2.5 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-white/50 uppercase">Status</label>
                  <select
                    name="status"
                    defaultValue={editingShift.status}
                    className="appearance-none px-3 py-2 rounded-lg bg-white/5 border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
                  >
                    {["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED", "EDITED"].map((s) => (
                      <option key={s} value={s} className="bg-[#12151a]">{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 bottom-2.5 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/50 uppercase">Notes (Mod)</label>
                <textarea
                  name="notes"
                  defaultValue={editingShift.notes || ""}
                  rows={2}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-accent)] resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/50 uppercase">Admin Notes</label>
                <textarea
                  name="adminNotes"
                  defaultValue={editingShift.adminNotes || ""}
                  rows={2}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-accent)] resize-none"
                />
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingShift(null)}
                  className="px-4 py-2 rounded-lg font-bold text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg font-bold text-sm bg-[var(--ep-accent)] text-[var(--ep-bg-deep)] hover:bg-[var(--ep-accent-hover)] transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
