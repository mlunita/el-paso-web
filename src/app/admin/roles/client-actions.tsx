"use client";

import { deleteRole } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RoleActions({ id, tokenCount }: { id: string; tokenCount: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (tokenCount > 0) {
      toast.error("Cannot delete role with active tokens. Revoke tokens first.");
      return;
    }
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(id);
      toast.success("Role deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-medium rounded-md shadow-sm disabled:opacity-50"
      disabled={tokenCount > 0}
      title={tokenCount > 0 ? "Revoke tokens first" : "Delete role"}
    >
      Delete
    </button>
  );
}
