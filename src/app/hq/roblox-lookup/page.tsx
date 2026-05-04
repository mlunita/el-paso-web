"use client";

import { useState, useActionState } from "react";
import {
  Search, User, Calendar, Shield, AlertTriangle, FileText,
  Ban, ExternalLink, Clock, Loader2, ClipboardList,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { adminRobloxLookup } from "@/app/hq/moderation-actions";

type LookupResult = {
  success: boolean;
  error?: string;
  user?: {
    userId: string; username: string; displayName: string | null;
    description: string | null; avatarUrl: string | null;
    accountCreated: string | null; isBanned: boolean;
  };
  internal?: {
    applications: { id: string; refCode: string; discord: string; roblox: string; status: string; createdAt: string }[];
    banRequests: { id: string; status: string; reason: string; modName: string; modRole: string; createdAt: string; evidenceCount: number }[];
    modActions: { id: string; actionType: string; reason: string; modName: string; modRole: string; reviewStatus: string; createdAt: string }[];
    lookupCount: number;
  };
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  BAN_REQUEST: "Ban Request", MODLOG: "Mod Log", TICKET: "Ticket",
  CHEATER_BAN: "Cheater Ban", WARNING: "Warning", KICK: "Kick",
  APPEAL_REVIEW: "Appeal Review", STAFF_NOTE: "Staff Note",
  CASE_REVIEW: "Case Review", INTERNAL_ESCALATION: "Internal Escalation",
  CUSTOM: "Custom",
};

export default function AdminRobloxLookupPage() {
  const [result, setResult] = useState<LookupResult | null>(null);
  const [searching, setSearching] = useState(false);

  const [, formAction] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      setSearching(true);
      const res = await adminRobloxLookup(prevState, formData);
      setResult(res as LookupResult);
      setSearching(false);
      return res;
    },
    null
  );

  const user = result?.user;
  const internal = result?.internal;

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          Roblox Lookup{" "}
          <span className="text-white/20 font-medium text-lg ml-2">Admin</span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          Search for Roblox users and view full internal moderation history.
        </p>
      </div>

      {/* Search */}
      <form action={formAction} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text" name="query" required maxLength={50}
              placeholder="Username or User ID..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.05] border border-[var(--ep-border)] text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]/40"
            />
          </div>
          <button
            type="submit" disabled={searching}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{  color: "#06080a" }}
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
        {result && !result.success && (
          <p className="text-red-400 text-sm mt-2">{result.error}</p>
        )}
      </form>

      {/* Results */}
      {user && (
        <div className="space-y-6 ">
          {/* Profile */}
          <Card
            className="relative overflow-hidden rounded-2xl p-0 border-0"
            style={{
              background: user.isBanned
                ? "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)"
                : "linear-gradient(135deg, rgba(232,164,74,0.08) 0%, rgba(232,164,74,0.03) 100%)",
              border: user.isBanned
                ? "1px solid rgba(239,68,68,0.2)"
                : "1px solid rgba(232,164,74,0.15)",
            }}
          >
            <div className="p-6 flex items-start gap-6">
              <div className="relative flex-shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-24 h-24 rounded-2xl border-2 border-[var(--ep-border)]" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-white/[0.05]">
                    <User className="w-10 h-10 text-white/20" />
                  </div>
                )}
                {user.isBanned && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <Ban className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{user.displayName || user.username}</h2>
                  {user.isBanned && (
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-400">BANNED</span>
                  )}
                </div>
                <p className="text-white/40 text-sm mb-3">@{user.username} · ID: {user.userId}</p>
                {user.description && (
                  <p className="text-white/30 text-sm leading-relaxed line-clamp-3 mb-3">{user.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-white/30">
                  {user.accountCreated && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {new Date(user.accountCreated).toLocaleDateString()}
                    </span>
                  )}
                  <a href={`https://www.roblox.com/users/${user.userId}/profile`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[var(--ep-accent)] hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> View on Roblox
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Internal Data */}
          {internal && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Ban Requests */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Ban Requests ({internal.banRequests.length})
                </h3>
                {internal.banRequests.length === 0 ? (
                  <p className="text-white/20 text-sm">No ban requests.</p>
                ) : (
                  <div className="space-y-2">
                    {internal.banRequests.map((b) => (
                      <div key={b.id} className="p-3 rounded-lg bg-white/[0.03] border border-[var(--ep-border)]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white/60">{b.status}</span>
                          <span className="text-[10px] text-white/20">by {b.modName} ({b.modRole})</span>
                        </div>
                        <p className="text-xs text-white/40 line-clamp-2">{b.reason}</p>
                        <div className="text-[10px] text-white/20 mt-1">
                          {new Date(b.createdAt).toLocaleDateString()} · {b.evidenceCount} evidence
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mod Actions */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Mod Actions ({internal.modActions.length})
                </h3>
                {internal.modActions.length === 0 ? (
                  <p className="text-white/20 text-sm">No mod actions.</p>
                ) : (
                  <div className="space-y-2">
                    {internal.modActions.map((a) => (
                      <div key={a.id} className="p-3 rounded-lg bg-white/[0.03] border border-[var(--ep-border)]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white/60">{ACTION_TYPE_LABELS[a.actionType] || a.actionType}</span>
                          <span className="text-[10px] text-white/20">{a.reviewStatus}</span>
                        </div>
                        <p className="text-xs text-white/40 line-clamp-2">{a.reason}</p>
                        <div className="text-[10px] text-white/20 mt-1">
                          by {a.modName} · {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Applications */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Applications ({internal.applications.length})
                </h3>
                {internal.applications.length === 0 ? (
                  <p className="text-white/20 text-sm">No applications.</p>
                ) : (
                  <div className="space-y-2">
                    {internal.applications.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-[var(--ep-border)]">
                        <span className="text-xs font-mono text-white/40">{a.refCode}</span>
                        <span className="text-xs font-bold text-white/60">{a.status}</span>
                        <span className="text-[10px] text-white/20">Discord: {a.discord}</span>
                        <span className="text-[10px] text-white/20 ml-auto">{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lookup Stats */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-[var(--ep-border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Lookup History
                </h3>
                <p className="text-white/50 text-sm">
                  This user has been looked up <strong className="text-white">{internal.lookupCount}</strong> time(s).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
