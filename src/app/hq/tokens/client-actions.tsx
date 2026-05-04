"use client";

import { revokeModeratorToken, reactivateModeratorToken, adminDeleteModeratorToken } from "@/app/hq/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Trash2 } from "lucide-react";

export function TokenActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const { t } = useI18n();

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

  if (status === "DELETED") {
    return <span className="text-white/30 text-xs">Deleted</span>;
  }

  return (
    <div className="flex items-center gap-2">
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
