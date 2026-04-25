"use client";

import { revokeModeratorToken, reactivateModeratorToken } from "@/app/hq/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TokenActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  const handleRevoke = async () => {
    if (!confirm("Revoke this token? The moderator will lose access immediately.")) return;
    try {
      await revokeModeratorToken(id);
      toast.success("Token revoked");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke");
    }
  };

  const handleReactivate = async () => {
    if (!confirm("Reactivate this token?")) return;
    try {
      await reactivateModeratorToken(id);
      toast.success("Token reactivated");
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
