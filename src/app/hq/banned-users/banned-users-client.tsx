"use client";

import { useState, useTransition } from "react";
import { Database, Plus, Trash2, Users, Loader2, AlertOctagon } from "lucide-react";
import { processBannedUsersChunk, removeBannedUser, deleteAllBannedUsers } from "../banned-users-actions";
import { useRouter } from "next/navigation";

type BannedUser = {
  id: string;
  robloxUserId: string | null;
  username: string;
  status: string;
  reason: string | null;
  description: string | null;
  createdAt: Date;
};

export default function BannedUsersClient({
  initialUsers,
  total,
  currentPage,
}: {
  initialUsers: BannedUser[];
  total: number;
  currentPage: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, active: false, added: 0 });

  const handleBulkAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const rawInput = formData.get("users") as string;
    const status = (formData.get("status") as string) || "BANNED";
    const reason = (formData.get("reason") as string) || null;
    const description = (formData.get("description") as string) || null;

    if (!rawInput.trim()) return;

    // Remove duplicates client-side
    const queries = Array.from(new Set(
      rawInput.split(/[\n,]+/).map((q) => q.trim()).filter((q) => q.length > 0)
    ));

    if (queries.length === 0) return;

    setProgress({ current: 0, total: queries.length, active: true, added: 0 });

    const chunkSize = 100;
    let totalAdded = 0;

    for (let i = 0; i < queries.length; i += chunkSize) {
      const chunk = queries.slice(i, i + chunkSize);
      
      const res = await processBannedUsersChunk(chunk, status, reason, description);
      
      if (res.success) {
        totalAdded += res.addedCount || 0;
      }

      setProgress(prev => ({ 
        ...prev, 
        current: Math.min(i + chunkSize, queries.length),
        added: totalAdded
      }));
    }

    setProgress(prev => ({ ...prev, active: false }));
    alert(`Finished processing! Added/Updated ${totalAdded} users.`);
    router.refresh();
  };

  const handleRemove = (id: string) => {
    if (!confirm("Remove this user from the database?")) return;
    startTransition(async () => {
      await removeBannedUser(id);
      router.refresh();
    });
  };

  const handleWipeDatabase = () => {
    if (!confirm("WARNING: Are you absolutely sure you want to DELETE ALL records from the database? This cannot be undone!")) return;
    if (!confirm("FINAL CONFIRMATION: Type OK to wipe the database.")) return;
    
    startTransition(async () => {
      await deleteAllBannedUsers();
      alert("Database wiped successfully.");
      router.refresh();
    });
  };

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[var(--ep-border)] pb-6 gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
            Database <span className="text-white/20 font-medium text-lg ml-2">Records</span>
          </h1>
          <p className="text-white/30 text-sm mt-1.5">
            Manage the banned users database. Total records: {total}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleWipeDatabase}
            disabled={isPending || progress.active}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
            title="Wipe Database"
          >
            <AlertOctagon className="w-4 h-4" /> Wipe All
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={progress.active}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-[var(--ep-accent)] text-white rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Bulk Add Users
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-white/[0.02] border border-[var(--ep-border)] rounded-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-[var(--ep-accent)]" /> Bulk Add to Database
          </h2>
          <form onSubmit={handleBulkAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Usernames or IDs (comma or newline separated)
              </label>
              <textarea
                name="users"
                rows={5}
                required
                disabled={progress.active}
                placeholder="RobloxUsername1, 12345678, PlayerName2..."
                className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)] disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  name="status"
                  disabled={progress.active}
                  className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)] disabled:opacity-50"
                >
                  <option value="BANNED">BANNED</option>
                  <option value="REPORTED">REPORTED</option>
                  <option value="CLEAN">CLEAN</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                  Reason (Short)
                </label>
                <input
                  type="text"
                  name="reason"
                  disabled={progress.active}
                  placeholder="e.g. Exploiting, Mass RDM..."
                  className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)] disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Detailed Description / Evidence Links
              </label>
              <textarea
                name="description"
                rows={3}
                disabled={progress.active}
                placeholder="Additional details..."
                className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)] disabled:opacity-50"
              />
            </div>
            
            {progress.active ? (
              <div className="w-full bg-[#0f0f12] rounded-lg p-4 border border-[var(--ep-border)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--ep-accent)]" /> 
                    Processing Data...
                  </span>
                  <span className="text-xs text-white/50">{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[var(--ep-accent)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, (progress.current / progress.total) * 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-green-400">Successfully matched/added: {progress.added} users</div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 bg-[var(--ep-accent)] text-white font-bold rounded-lg hover:brightness-110 transition-all"
              >
                Process and Add Users
              </button>
            )}
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)]">
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">User</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Status</th>
              <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3 pr-4">Reason</th>
              <th className="text-right text-[10px] font-bold uppercase tracking-wider text-white/30 pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((user) => (
              <tr key={user.id} className="border-b border-[var(--ep-border)] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-white">{user.username}</div>
                  <div className="text-[10px] text-white/30">{user.robloxUserId || "No ID"}</div>
                </td>
                <td className="py-3 pr-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    user.status === "BANNED" ? "bg-red-500/10 text-red-500" :
                    user.status === "REPORTED" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-green-500/10 text-green-500"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="text-white/70 max-w-xs truncate">{user.reason || "—"}</div>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleRemove(user.id)}
                    disabled={isPending}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initialUsers.length === 0 && (
          <div className="text-center py-12 text-white/20 text-sm flex flex-col items-center">
            <Database className="w-8 h-8 mb-2 opacity-50" />
            No database records found.
          </div>
        )}
      </div>
    </div>
  );
}
