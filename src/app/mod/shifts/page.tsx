"use client";

import { useState, useEffect, useTransition, useActionState } from "react";
import {
  Clock, Play, Pause, Square, Timer, Calendar, Coffee,
  ChevronDown, FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  clockIn,
  clockOut,
  pauseShift,
  resumeShift,
  getMyActiveShift,
  getMyShiftHistory,
} from "@/app/mod/shift-actions";
import { SHIFT_TYPES } from "@/lib/validation";

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
  REGULAR: "Regular",
  TRAINING: "Training",
  EVENT: "Event",
  EMERGENCY: "Emergency",
  OVERTIME: "Overtime",
};

const SHIFT_TYPE_COLORS: Record<string, string> = {
  REGULAR: "#4ecdc4",
  TRAINING: "#f59e0b",
  EVENT: "#8b5cf6",
  EMERGENCY: "#ef4444",
  OVERTIME: "#e8a44a",
};

type ShiftData = {
  id: string;
  status: string;
  shiftType: string;
  clockIn: string;
  clockOut: string | null;
  totalSeconds: number;
  breakSeconds: number;
  notes: string | null;
  adminNotes: string | null;
  editedBy: string | null;
  breaks: {
    id: string;
    startedAt: string;
    endedAt: string | null;
    duration: number;
    reason: string | null;
  }[];
};

export default function ShiftsPage() {
  const [activeShift, setActiveShift] = useState<ShiftData | null>(null);
  const [history, setHistory] = useState<ShiftData[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [clockInState, clockInAction] = useActionState(clockIn, null);
  const [clockOutState, clockOutAction] = useActionState(clockOut, null);
  const [pauseState, pauseAction] = useActionState(pauseShift, null);

  const fetchData = async () => {
    try {
      const [shift, historyData] = await Promise.all([
        getMyActiveShift(),
        getMyShiftHistory(),
      ]);
      setActiveShift(shift as unknown as ShiftData);
      setHistory((historyData.shifts || []) as unknown as ShiftData[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch after actions
  useEffect(() => {
    if (clockInState?.success || clockOutState?.success || pauseState?.success) {
      fetchData();
    }
  }, [clockInState, clockOutState, pauseState]);

  // Live timer
  useEffect(() => {
    if (!activeShift || activeShift.status === "PAUSED") return;

    const interval = setInterval(() => {
      const start = new Date(activeShift.clockIn).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  // Calculate break time for active shift
  const currentBreakSeconds = activeShift?.breaks?.reduce((acc, b) => {
    if (b.endedAt) return acc + b.duration;
    return acc + Math.floor((Date.now() - new Date(b.startedAt).getTime()) / 1000);
  }, 0) || 0;

  const workingTime = Math.max(0, elapsed - currentBreakSeconds);

  const handleResume = () => {
    startTransition(async () => {
      const result = await resumeShift();
      if (result?.success) fetchData();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white/30">Loading shifts...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          Shift{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--ep-secondary)] to-emerald-400">
            Management
          </span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          Clock in, track your time, and manage your shifts.
        </p>
      </div>

      {/* Active Shift Panel */}
      <Card
        className=" relative overflow-hidden rounded-2xl p-0 border-0 mb-8"
        
      >
        <div className="p-8">
          {activeShift ? (
            <>
              {/* Live shift display */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: activeShift.status === "PAUSED" ? "#f59e0b" : "#22c55e",
                      
                    }}
                  />
                  {activeShift.status === "ACTIVE" && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: "rgba(34,197,94,0.4)" }}
                    />
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                  {activeShift.status === "PAUSED" ? "ON BREAK" : "ON DUTY"}
                </span>
                <span
                  className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{
                    background: `${SHIFT_TYPE_COLORS[activeShift.shiftType] || "#4ecdc4"}20`,
                    color: SHIFT_TYPE_COLORS[activeShift.shiftType] || "#4ecdc4",
                  }}
                >
                  {SHIFT_TYPE_LABELS[activeShift.shiftType] || activeShift.shiftType}
                </span>
              </div>

              {/* Timer */}
              <div className="text-center mb-8">
                <div className="text-6xl font-extrabold tabular-nums text-white tracking-wider mb-2">
                  {formatDuration(workingTime)}
                </div>
                <div className="text-sm text-white/30">
                  Working time (excl. {formatDuration(currentBreakSeconds)} break)
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                {activeShift.status === "ACTIVE" ? (
                  <>
                    <form action={pauseAction}>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                        style={{
                          background: "rgba(245,158,11,0.15)",
                          
                          color: "#f59e0b",
                        }}
                      >
                        <Pause className="w-4 h-4" /> Take Break
                      </button>
                    </form>
                    <form action={clockOutAction}>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          
                          color: "#ef4444",
                        }}
                      >
                        <Square className="w-4 h-4" /> Clock Out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleResume}
                      disabled={isPending}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                      style={{
                        background: "rgba(34,197,94,0.15)",
                        
                        color: "#22c55e",
                      }}
                    >
                      <Play className="w-4 h-4" /> Resume
                    </button>
                    <form action={clockOutAction}>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          
                          color: "#ef4444",
                        }}
                      >
                        <Square className="w-4 h-4" /> Clock Out
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Break log */}
              {activeShift.breaks && activeShift.breaks.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[var(--ep-border)]">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">
                    Breaks ({activeShift.breaks.length})
                  </div>
                  <div className="space-y-1">
                    {activeShift.breaks.map((b) => (
                      <div key={b.id} className="flex items-center gap-2 text-xs text-white/40">
                        <Coffee className="w-3 h-3" />
                        <span>{formatDate(b.startedAt)}</span>
                        <span className="text-white/20">→</span>
                        <span>{b.endedAt ? formatDate(b.endedAt) : "ongoing"}</span>
                        <span className="ml-auto font-mono">
                          {b.endedAt ? formatDuration(b.duration) : "..."}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Clock in form */
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(78,205,196,0.1)" }}>
                <Clock className="w-8 h-8 text-[var(--ep-secondary)]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Not clocked in</h2>
              <p className="text-white/30 text-sm mb-6">Start a new shift to track your moderation time.</p>

              <form action={clockInAction} className="max-w-sm mx-auto space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Shift Type
                  </label>
                  <div className="relative">
                    <select
                      name="shiftType"
                      defaultValue="REGULAR"
                      className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-secondary)]/40"
                    >
                      {SHIFT_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-[#12151a] text-white">
                          {SHIFT_TYPE_LABELS[type] || type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    maxLength={500}
                    placeholder="Any notes for this shift..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm resize-none focus:outline-none focus:border-[var(--ep-secondary)]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    
                    color: "#06080a",
                    
                  }}
                >
                  <Play className="w-4 h-4" />
                  {isPending ? "Clocking In..." : "Clock In"}
                </button>
              </form>

              {clockInState && !clockInState.success && (
                <p className="text-red-400 text-sm mt-3">{clockInState.error}</p>
              )}
            </div>
          )}

          {/* Action errors */}
          {clockOutState && !clockOutState.success && (
            <p className="text-red-400 text-sm mt-3 text-center">{clockOutState.error}</p>
          )}
          {pauseState && !pauseState.success && (
            <p className="text-red-400 text-sm mt-3 text-center">{pauseState.error}</p>
          )}
        </div>
      </Card>

      {/* Shift History */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Shift History
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-12 text-white/20 text-sm">
            No shift history yet. Clock in to start tracking.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((shift, i) => (
              <div
                key={shift.id}
                className=" flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-[var(--ep-border)] hover:border-[var(--ep-border-accent)] transition-all duration-200"
                
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${SHIFT_TYPE_COLORS[shift.shiftType] || "#4ecdc4"}15`,
                  }}
                >
                  <Timer
                    className="w-5 h-5"
                    style={{ color: SHIFT_TYPE_COLORS[shift.shiftType] || "#4ecdc4" }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">
                      {SHIFT_TYPE_LABELS[shift.shiftType] || shift.shiftType}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background:
                          shift.status === "COMPLETED"
                            ? "rgba(34,197,94,0.15)"
                            : shift.status === "CANCELLED"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          shift.status === "COMPLETED"
                            ? "#22c55e"
                            : shift.status === "CANCELLED"
                            ? "#ef4444"
                            : "#f59e0b",
                      }}
                    >
                      {shift.status}
                    </span>
                    {shift.editedBy && (
                      <span className="text-[10px] text-yellow-400/60 font-medium">
                        (edited)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/30">
                    {formatDate(shift.clockIn)}
                    {shift.clockOut && ` → ${formatDate(shift.clockOut)}`}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold tabular-nums text-white">
                    {formatDuration(shift.totalSeconds - shift.breakSeconds)}
                  </div>
                  {shift.breakSeconds > 0 && (
                    <div className="text-[10px] text-white/30">
                      +{formatDuration(shift.breakSeconds)} break
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
