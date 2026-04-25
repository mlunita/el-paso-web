"use client";

import { revokeAdminToken, reactivateAdminToken } from "@/app/hq/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AdminTokenActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  const handleRevoke = async () => {
    if (!confirm("Revoke this admin token? The holder will lose access immediately.")) return;
    try {
      await revokeAdminToken(id);
      toast.success("Admin token revoked");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke");
    }
  };

  const handleReactivate = async () => {
    if (!confirm("Reactivate this admin token?")) return;
    try {
      await reactivateAdminToken(id);
      toast.success("Admin token reactivated");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate");
    }
  };

  if (status === "ACTIVE") {
    return (
      <button
        onClick={handleRevoke}
        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium rounded-md shadow-sm"
      >
        Revoke
      </button>
    );
  }

  if (status === "REVOKED") {
    return (
      <button
        onClick={handleReactivate}
        className="px-3 py-1.5 bg-green-600/80 hover:bg-green-500 text-white text-xs font-medium rounded-md shadow-sm"
      >
        Reactivate
      </button>
    );
  }

  return <span className="text-white/30 text-xs">—</span>;
}
