"use client";

import { deleteRole } from "@/app/hq/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

export function RoleActions({ id, tokenCount }: { id: string; tokenCount: number }) {
  const router = useRouter();
  const { t } = useI18n();

  const handleDelete = async () => {
    if (tokenCount > 0) {
      toast.error(t.admin.roles.cannotDeleteWithTokens);
      return;
    }
    if (!confirm(t.admin.roles.confirmDelete)) return;
    try {
      await deleteRole(id);
      toast.success(t.admin.roles.toastDeleted);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t.admin.roles.toastDeleteFailed);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium rounded-md shadow-sm disabled:opacity-50"
      disabled={tokenCount > 0}
      title={tokenCount > 0 ? t.admin.roles.revokeFirst : t.admin.roles.deleteRole}
    >
      {t.common.delete}
    </button>
  );
}
