"use client";

import { useState, useTransition } from "react";
import { Search, ShieldCheck, AlertTriangle, ShieldAlert, User, Calendar, Info } from "lucide-react";
import { searchBannedUser } from "@/app/hq/banned-users-actions";
import Image from "next/image";

export default function DatabaseClient() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    setResult(null);

    startTransition(async () => {
      const res = await searchBannedUser(query);
      setResult(res);
    });
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-[80vh]">
      <div className="text-center mb-12">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Player <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--ep-accent)] to-blue-500">Database</span>
        </h1>
        <p className="text-[var(--ep-text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
          Search our database to check a player's standing in the community, view their Roblox profile information, and verify if they have any active reports or bans.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-16">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-[var(--ep-text-muted)]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Roblox Username or ID..."
          className="block w-full pl-12 pr-32 py-5 bg-[var(--ep-bg-elevated)] border border-[var(--ep-border)] rounded-2xl text-[var(--ep-text-primary)] placeholder-[var(--ep-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ep-accent)] focus:border-transparent text-lg shadow-2xl transition-all"
        />
        <div className="absolute inset-y-2 right-2 flex items-center">
          <button
            type="submit"
            disabled={isPending || !query.trim()}
            className="px-6 py-3 bg-[var(--ep-accent)] hover:brightness-110 text-white rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isPending ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {hasSearched && result && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!result.found ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-400 mb-2">User Not Found</h3>
              <p className="text-white/60">We couldn't find a Roblox user matching "{query}". Please check the spelling or ID and try again.</p>
            </div>
          ) : (
            <div className="bg-[var(--ep-bg-elevated)] border border-[var(--ep-border)] rounded-3xl overflow-hidden shadow-2xl">
              {/* Header Profile Area */}
              <div className="p-8 border-b border-[var(--ep-border)] flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--ep-accent)] to-transparent opacity-50" />
                
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-[#0f0f12] border border-[var(--ep-border)]">
                  {result.roblox.avatarUrl ? (
                    <Image src={result.roblox.avatarUrl} alt={result.roblox.username} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                    {result.roblox.displayName || result.roblox.username}
                    {result.roblox.displayName && <span className="text-sm font-normal text-white/40">@{result.roblox.username}</span>}
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-white/40 mb-3">
                    <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> ID: {result.roblox.userId}</span>
                    {result.roblox.accountCreated && (
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(result.roblox.accountCreated).getFullYear()}</span>
                    )}
                  </div>
                  {result.roblox.description && (
                    <p className="text-sm text-white/60 line-clamp-2 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                      "{result.roblox.description}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status Section */}
              <div className="p-8 bg-[#0a0a0c]">
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">Database Record</h3>
                
                {!result.record || result.record.status === "CLEAN" ? (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-500 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-400 mb-1">Clean Record</h4>
                      <p className="text-green-500/70 text-sm leading-relaxed">
                        This user has no active bans or reports in our database. They are in good standing with the community.
                      </p>
                    </div>
                  </div>
                ) : result.record.status === "REPORTED" ? (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-yellow-400 mb-1">Reported User</h4>
                      <p className="text-yellow-500/70 text-sm leading-relaxed mb-4">
                        This user currently has active reports or warnings on their record.
                      </p>
                      <div className="bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/10">
                        <div className="text-xs text-yellow-500/50 uppercase font-bold tracking-wider mb-1">Reason</div>
                        <div className="text-yellow-400/90 text-sm mb-3">{result.record.reason || "No specific reason provided."}</div>
                        {result.record.description && (
                          <>
                            <div className="text-xs text-yellow-500/50 uppercase font-bold tracking-wider mb-1">Details</div>
                            <div className="text-yellow-400/70 text-sm">{result.record.description}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="p-3 bg-red-500/20 rounded-xl text-red-500 shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-red-400 mb-1">Banned User</h4>
                      <p className="text-red-500/70 text-sm leading-relaxed mb-4">
                        This user is permanently banned from our community.
                      </p>
                      <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10">
                        <div className="text-xs text-red-500/50 uppercase font-bold tracking-wider mb-1">Reason</div>
                        <div className="text-red-400/90 text-sm mb-3">{result.record.reason || "No specific reason provided."}</div>
                        {result.record.description && (
                          <>
                            <div className="text-xs text-red-500/50 uppercase font-bold tracking-wider mb-1">Details</div>
                            <div className="text-red-400/70 text-sm">{result.record.description}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {result.roblox.isBannedOnRoblox && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-red-400/60 bg-red-500/5 py-2 px-4 rounded-lg border border-red-500/10">
                    <AlertTriangle className="w-3.5 h-3.5" /> Note: This account is terminated or banned on Roblox itself.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
