"use client";

import { revokeModeratorToken, reactivateModeratorToken, adminDeleteModeratorToken, adminUpdateTokenRole } from "@/app/hq/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Trash2, Pencil, Check, X, Loader2 } from "lucide-react";

type RoleItem = { id: string; name: string };

export function TokenActions({
  id,
  status,
  currentRoleId,
  roles,
}: {
  id: string;
  status: string;
  currentRoleId: string;
  roles: RoleItem[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const [savingRole, setSavingRole] = useState(false);

  const handleRevoke = async () => {
    if (!confirm(t.admin.tokens.confirmRevoke)) return;
    try {
      await revokeModeratorToken(id);
      toast.success(t.admin.tokens.revoked);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t.admin.tokens.revokeFailed);
    }
  };

  const handleReactivate = async () => {
    if (!confirm(t.admin.tokens.confirmReactivate)) return;
    try {
      await reactivateModeratorToken(id);
      toast.success(t.admin.tokens.reactivated);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t.admin.tokens.reactivateFailed);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete this token? This will preserve historical logs but hide the token from active views.")) return;
    try {
      await adminDeleteModeratorToken(id);
      toast.success("Token deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete token");
    }
  };

  const handleSaveRole = async () => {
    if (selectedRoleId === currentRoleId) {
      setEditingRole(false);
      return;
    }
    try {
      setSavingRole(true);
      await adminUpdateTokenRole(id, selectedRoleId);
      toast.success("Role updated successfully");
      setEditingRole(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setSavingRole(false);
    }
  };

  if (status === "DELETED") {
    return <span className="text-white/30 text-xs">Deleted</span>;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Role Editing */}
      {editingRole ? (
        <div className="flex items-center gap-1.5">
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            disabled={savingRole}
            className="h-7 px-2 rounded-md bg-black/50 border border-white/20 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ep-accent)]/50"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <button
            onClick={handleSaveRole}
            disabled={savingRole}
            className="p-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors disabled:opacity-50"
            title="Save"
          >
            {savingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => { setEditingRole(false); setSelectedRoleId(currentRoleId); }}
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/50 transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditingRole(true)}
          className="p-1.5 bg-white/5 hover:bg-[var(--ep-accent)]/20 hover:text-[var(--ep-accent)] text-zinc-400 rounded-md transition-colors"
          title="Edit Role"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Status Actions */}
      {status === "ACTIVE" && (
        <button
          onClick={handleRevoke}
          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium rounded-md shadow-sm"
        >
          {t.common.revoke}
        </button>
      )}
      {status === "REVOKED" && (
        <button
          onClick={handleReactivate}
          className="px-3 py-1.5 bg-green-600/80 hover:bg-green-500 text-white text-xs font-medium rounded-md shadow-sm"
        >
          {t.common.reactivate}
        </button>
      )}
      
      <button
        onClick={handleDelete}
        className="p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 rounded-md transition-colors"
        title="Delete Token"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
