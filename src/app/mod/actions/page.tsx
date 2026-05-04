"use client";

import { useState, useEffect, useActionState } from "react";
import {
  ClipboardList, Plus, Search, ExternalLink,
  AlertTriangle, FileText, Shield, Gavel, Ban, MessageSquare,
  Eye, XCircle, CheckCircle, Scale,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { createModAction, getMyModActions } from "@/app/mod/shift-actions";
import { ACTION_TYPES, ACTION_TYPE_LABELS } from "@/lib/validation";

const ACTION_ICONS: Record<string, typeof AlertTriangle> = {
  BAN_REQUEST: Ban,
  MODLOG: FileText,
  TICKET: MessageSquare,
  CHEATER_BAN: AlertTriangle,
  WARNING: AlertTriangle,
  KICK: XCircle,
  APPEAL_REVIEW: Scale,
  STAFF_NOTE: FileText,
  CASE_REVIEW: Eye,
  INTERNAL_ESCALATION: Shield,
  CUSTOM: ClipboardList,
};

const ACTION_COLORS: Record<string, string> = {
  BAN_REQUEST: "#ef4444",
  MODLOG: "#4ecdc4",
  TICKET: "#f59e0b",
  CHEATER_BAN: "#ef4444",
  WARNING: "#f59e0b",
  KICK: "#ef4444",
  APPEAL_REVIEW: "#8b5cf6",
  STAFF_NOTE: "#22c55e",
  CASE_REVIEW: "#4ecdc4",
  INTERNAL_ESCALATION: "#e8a44a",
  CUSTOM: "#8a8d95",
};

const REVIEW_COLORS: Record<string, { bg: string; text: string }> = {
  UNREVIEWED: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  REVIEWED: { bg: "rgba(34,197,94,0.15)", text: "#22c55e" },
  FLAGGED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
  REJECTED: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
};

type ModActionData = {
  id: string;
  actionType: string;
  preset: string | null;
  targetUser: string | null;
  reason: string;
  evidenceLink: string;
  internalNotes: string | null;
  reviewStatus: string;
  createdAt: string;
};

export default function ActionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [myActions, setMyActions] = useState<ModActionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [formState, formAction] = useActionState(createModAction, null);

  const fetchActions = async () => {
    try {
      const data = await getMyModActions();
      setMyActions((data.actions || []) as unknown as ModActionData[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  useEffect(() => {
    if (formState?.success) {
      setShowForm(false);
      fetchActions();
    }
  }, [formState]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)] flex items-start justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
            Action{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--ep-secondary)] to-emerald-400">
              Registry
            </span>
          </h1>
          <p className="text-white/30 text-sm mt-1.5">
            Register every moderation action you take for accountability and review.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
          style={{
            
            color: "#06080a",
            
          }}
        >
          <Plus className="w-4 h-4" />
          Register Action
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card
          className=" relative overflow-hidden rounded-2xl p-0 border-0 mb-8"
          style={{
            background: "rgba(78,205,196,0.06)",
            
          }}
        >
          <div className="p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[var(--ep-secondary)]" />
              Register Moderation Action
            </h2>

            <form action={formAction} className="space-y-4">
              {/* Action Type Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
                  Action Type *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ACTION_TYPES.map((type) => {
                    const Icon = ACTION_ICONS[type] || ClipboardList;
                    const color = ACTION_COLORS[type] || "#8a8d95";
                    return (
                      <label
                        key={type}
                        className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
                        style={{
                          background: `${color}08`,
                          
                        }}
                      >
                        <input
                          type="radio"
                          name="actionType"
                          value={type}
                          defaultChecked={type === "MODLOG"}
                          className="sr-only peer"
                        />
                        <div className="peer-checked:scale-110 transition-transform">
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 peer-checked:text-white text-center leading-tight">
                          {ACTION_TYPE_LABELS[type]}
                        </span>
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 peer-checked:opacity-100 transition-opacity"
                          style={{  background: `${color}10` }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Target User */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Target User *
                </label>
                <input
                  type="text"
                  name="targetUser"
                  required
                  maxLength={100}
                  placeholder="Roblox username or user ID"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-secondary)]/40"
                />
              </div>

              {/* Evidence Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Evidence Link *
                </label>
                <input
                  type="url"
                  name="evidenceLink"
                  required
                  maxLength={500}
                  placeholder="https://discord.com/channels/... or link to evidence"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-secondary)]/40"
                />
                <p className="text-[10px] text-white/20 mt-1">Must be a valid URL (https://...)</p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  required
                  minLength={3}
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe the reason for this action..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm resize-none focus:outline-none focus:border-[var(--ep-secondary)]/40"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Internal Notes (optional)
                </label>
                <textarea
                  name="internalNotes"
                  maxLength={2000}
                  rows={2}
                  placeholder="Private notes for admins..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm resize-none focus:outline-none focus:border-[var(--ep-secondary)]/40"
                />
              </div>

              {formState && !formState.success && (
                <p className="text-red-400 text-sm">{formState.error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm"
                  style={{
                    
                    color: "#06080a",
                  }}
                >
                  <CheckCircle className="w-4 h-4" /> Register Action
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* My Actions List */}
      {loading ? (
        <div className="text-center py-12 text-white/30 text-sm">Loading actions...</div>
      ) : myActions.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/20 text-sm">No actions registered yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myActions.map((action, i) => {
            const Icon = ACTION_ICONS[action.actionType] || ClipboardList;
            const color = ACTION_COLORS[action.actionType] || "#8a8d95";
            const review = REVIEW_COLORS[action.reviewStatus] || REVIEW_COLORS.UNREVIEWED;

            return (
              <div
                key={action.id}
                className=" flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-[var(--ep-border)] hover:border-[var(--ep-border-accent)] transition-all duration-200"
                
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
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
                      {action.reviewStatus}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {action.targetUser && (
                      <span className="text-white/50">@{action.targetUser} — </span>
                    )}
                    {action.reason}
                  </div>
                  <div className="text-[10px] text-white/20 mt-0.5">
                    {new Date(action.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <a
                  href={action.evidenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-white/30" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
