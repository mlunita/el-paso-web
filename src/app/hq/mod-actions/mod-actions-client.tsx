"use client";

import { useState, useTransition, useActionState } from "react";
import {
  ClipboardList, Eye, CheckCircle, AlertTriangle,
  XCircle, ChevronDown, Trash2, ExternalLink, Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { adminReviewModAction, adminDeleteModAction } from "@/app/hq/moderation-actions";
import { ACTION_TYPE_LABELS } from "@/lib/validation";

const REVIEW_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  UNREVIEWED: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", label: "Unreviewed" },
  REVIEWED: { bg: "rgba(34,197,94,0.15)", text: "#22c55e", label: "Reviewed" },
  FLAGGED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", label: "Flagged" },
  REJECTED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", label: "Rejected" },
};

const ACTION_COLORS: Record<string, string> = {
  BAN_REQUEST: "#ef4444", MODLOG: "#4ecdc4", TICKET: "#f59e0b",
  CHEATER_BAN: "#ef4444", WARNING: "#f59e0b", KICK: "#ef4444",
  APPEAL_REVIEW: "#8b5cf6", STAFF_NOTE: "#22c55e", CASE_REVIEW: "#4ecdc4",
  INTERNAL_ESCALATION: "#e8a44a", CUSTOM: "#8a8d95",
};

type ActionData = {
  id: string; actionType: string; preset: string | null;
  modName: string; modId: string; modRole: string;
  targetUser: string | null; reason: string; evidenceLink: string;
  internalNotes: string | null; reviewStatus: string;
  reviewedBy: string | null; reviewNotes: string | null;
  createdAt: string;
  _count: { auditLogs: number };
};

export default function ModActionsClient({
  actions: initialActions,
  uniqueMods,
  counts,
}: {
  actions: ActionData[];
  uniqueMods: { modId: string; modName: string }[];
  counts: Record<string, number>;
}) {
  const [filterMod, setFilterMod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedAction, setSelectedAction] = useState<ActionData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [reviewState, reviewAction] = useActionState(adminReviewModAction, null);

  const filtered = initialActions.filter((a) => {
    if (filterMod && a.modId !== filterMod) return false;
    if (filterStatus && a.reviewStatus !== filterStatus) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    if (!confirm("Delete this mod action record?")) return;
    startTransition(async () => {
      await adminDeleteModAction(id);
      window.location.reload();
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          Mod Actions{" "}
          <span className="text-white/20 font-medium text-lg ml-2">Registry</span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          Review all registered moderation actions from staff.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Object.entries(counts).map(([status, count]) => {
          const style = REVIEW_COLORS[status] || REVIEW_COLORS.UNREVIEWED;
          return (
            <div
              key={status}
              className="ep-card-enter p-4 rounded-xl text-center cursor-pointer transition-all hover:scale-105"
              style={{ background: style.bg, border: `1px solid ${style.text}20` }}
              onClick={() => setFilterStatus(filterStatus === status ? "" : status)}
            >
              <div className="text-2xl font-extrabold tabular-nums" style={{ color: style.text }}>
                {count}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                {style.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative">
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

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 rounded-lg bg-white/[0.05] border border-[var(--ep-border)] text-white text-xs focus:outline-none"
          >
            <option value="" className="bg-[#12151a]">All Statuses</option>
            {Object.entries(REVIEW_COLORS).map(([key, val]) => (
              <option key={key} value={key} className="bg-[#12151a]">{val.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Actions Table */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/20 text-sm">No actions match the current filters.</p>
          </div>
        ) : (
          filtered.map((action, i) => {
            const color = ACTION_COLORS[action.actionType] || "#8a8d95";
            const review = REVIEW_COLORS[action.reviewStatus] || REVIEW_COLORS.UNREVIEWED;

            return (
              <div
                key={action.id}
                className="ep-card-enter flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-[var(--ep-border)] hover:border-[var(--ep-border-accent)] transition-all duration-200"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <ClipboardList className="w-5 h-5" style={{ color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-white">
                      {ACTION_TYPE_LABELS[action.actionType] || action.actionType}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: review.bg, color: review.text }}
                    >
                      {review.label}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {action.targetUser && <span className="text-white/50">@{action.targetUser} — </span>}
                    {action.reason}
                  </div>
                  <div className="text-[10px] text-white/20 mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {action.modName} ({action.modRole})
                    </span>
                    <span>·</span>
                    <span>{new Date(action.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={action.evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                    title="View evidence"
                  >
                    <ExternalLink className="w-4 h-4 text-white/30" />
                  </a>
                  <button
                    onClick={() => setSelectedAction(action)}
                    className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                    title="Review"
                  >
                    <Eye className="w-4 h-4 text-[var(--ep-secondary)]" />
                  </button>
                  <button
                    onClick={() => handleDelete(action.id)}
                    disabled={isPending}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400/50" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card
            className="w-full max-w-lg mx-4 rounded-2xl p-0 border-0 ep-scale-in"
            style={{
              background: "linear-gradient(145deg, #0c0e12 0%, #12151a 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Review Action</h3>

              <div className="space-y-3 mb-6 text-sm">
                <div><span className="text-white/40">Type:</span> <span className="text-white">{ACTION_TYPE_LABELS[selectedAction.actionType]}</span></div>
                <div><span className="text-white/40">Target:</span> <span className="text-white">@{selectedAction.targetUser}</span></div>
                <div><span className="text-white/40">Mod:</span> <span className="text-white">{selectedAction.modName} ({selectedAction.modRole})</span></div>
                <div><span className="text-white/40">Reason:</span> <span className="text-white">{selectedAction.reason}</span></div>
                {selectedAction.internalNotes && (
                  <div><span className="text-white/40">Notes:</span> <span className="text-white/60">{selectedAction.internalNotes}</span></div>
                )}
                <a href={selectedAction.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-[var(--ep-secondary)] text-xs hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View Evidence
                </a>
              </div>

              <form action={reviewAction} className="space-y-4">
                <input type="hidden" name="actionId" value={selectedAction.id} />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">Review Status</label>
                  <select
                    name="reviewStatus"
                    defaultValue={selectedAction.reviewStatus}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm focus:outline-none"
                  >
                    <option value="UNREVIEWED" className="bg-[#12151a]">Unreviewed</option>
                    <option value="REVIEWED" className="bg-[#12151a]">Reviewed ✓</option>
                    <option value="FLAGGED" className="bg-[#12151a]">Flagged ⚠</option>
                    <option value="REJECTED" className="bg-[#12151a]">Rejected ✗</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">Review Notes</label>
                  <textarea
                    name="reviewNotes"
                    rows={2}
                    maxLength={1000}
                    placeholder="Optional admin notes..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm resize-none focus:outline-none"
                  />
                </div>

                {reviewState && !reviewState.success && (
                  <p className="text-red-400 text-sm">{reviewState.error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #e8a44a 0%, #c4882e 100%)", color: "#06080a" }}
                  >
                    <CheckCircle className="w-4 h-4" /> Save Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAction(null)}
                    className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
