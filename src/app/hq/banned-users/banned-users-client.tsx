"use client";

import { useState, useTransition } from "react";
import { Database, Plus, Search, Trash2, Users } from "lucide-react";
import { bulkAddBannedUsers, removeBannedUser } from "../banned-users-actions";

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
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ query: string; success: boolean; username?: string; error?: string }[] | null>(null);

  const handleBulkAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await bulkAddBannedUsers(formData);
      if (res.success) {
        setBulkResults(res.results || null);
        alert(`Successfully processed and added users.`);
      } else {
        alert(res.error || "Failed to bulk add.");
      }
    });
  };

  const handleRemove = (id: string) => {
    if (!confirm("Remove this user from the database?")) return;
    startTransition(async () => {
      await removeBannedUser(id);
      window.location.reload();
    });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between border-b border-[var(--ep-border)] pb-6">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
            Database <span className="text-white/20 font-medium text-lg ml-2">Records</span>
          </h1>
          <p className="text-white/30 text-sm mt-1.5">
            Manage the banned users database. Total records: {total}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ep-accent)] text-white rounded-lg font-bold text-sm hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Bulk Add Users
        </button>
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
                placeholder="RobloxUsername1, 12345678, PlayerName2..."
                className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  name="status"
                  className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
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
                  placeholder="e.g. Exploiting, Mass RDM..."
                  className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
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
                placeholder="Additional details..."
                className="w-full px-4 py-3 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg text-white text-sm focus:outline-none focus:border-[var(--ep-accent)]"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-[var(--ep-accent)] text-white font-bold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isPending ? "Processing..." : "Process and Add Users"}
            </button>
          </form>

          {bulkResults && (
            <div className="mt-6 p-4 bg-[#0f0f12] border border-[var(--ep-border)] rounded-lg">
              <h3 className="font-bold text-sm text-white mb-2">Processing Results</h3>
              <div className="max-h-40 overflow-y-auto text-xs space-y-1">
                {bulkResults.map((r, i) => (
                  <div key={i} className={r.success ? "text-green-400" : "text-red-400"}>
                    {r.query}: {r.success ? `Added as ${r.username}` : `Failed - ${r.error}`}
                  </div>
                ))}
              </div>
            </div>
          )}
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
