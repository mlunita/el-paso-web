"use client";

import { revokeAdminToken, reactivateAdminToken } from "@/app/hq/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

export function AdminTokenActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const { t } = useI18n();

  const handleRevoke = async () => {
    if (!confirm(t.admin.adminTokens.confirmRevoke)) return;
    try {
      await revokeAdminToken(id);
      toast.success(t.admin.adminTokens.revoked);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t.admin.adminTokens.revokeFailed);
    }
  };

  const handleReactivate = async () => {
    if (!confirm(t.admin.adminTokens.confirmReactivate)) return;
    try {
      await reactivateAdminToken(id);
      toast.success(t.admin.adminTokens.reactivated);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t.admin.adminTokens.reactivateFailed);
    }
  };

  if (status === "ACTIVE") {
    return (
      <button
        onClick={handleRevoke}
        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium rounded-md shadow-sm"
      >
        {t.common.revoke}
      </button>
    );
  }

  if (status === "REVOKED") {
    return (
      <button
        onClick={handleReactivate}
        className="px-3 py-1.5 bg-green-600/80 hover:bg-green-500 text-white text-xs font-medium rounded-md shadow-sm"
      >
        {t.common.reactivate}
      </button>
    );
  }

  return <span className="text-white/30 text-xs">{t.common.unavailable}</span>;
}
