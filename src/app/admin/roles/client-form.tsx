"use client";

import { useActionState, useEffect } from "react";
import { createRole, updateRole } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type PermissionItem = { id: string; key: string; label: string };

export function RoleForm({
  role,
  allPermissions,
}: {
  role?: {
    id: string;
    name: string;
    description: string | null;
    permissions: PermissionItem[];
  };
  allPermissions: PermissionItem[];
}) {
  const router = useRouter();
  const updateFn = role ? updateRole.bind(null, role.id) : createRole;
  const [state, formAction, pending] = useActionState(updateFn, null);

  const existingPermIds = role?.permissions.map((p) => p.id) || [];

  useEffect(() => {
    if (state?.success) {
      toast.success(role ? "Role updated successfully" : "Role created successfully");
      router.push("/admin/roles");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, role]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-400 font-bold">Role Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={role?.name}
          placeholder="e.g. Senior Moderator"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-400 font-bold">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={role?.description || ""}
          placeholder="Describe this role..."
          className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-zinc-400 font-bold">Permissions</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 rounded-xl bg-black/30 border border-white/5">
          {allPermissions.map((perm) => (
            <label
              key={perm.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <input
                type="checkbox"
                name="permissions"
                value={perm.id}
                defaultChecked={existingPermIds.includes(perm.id)}
                className="w-4 h-4 rounded border-white/20 bg-black/50 accent-[#a67c52]"
              />
              <div>
                <div className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                  {perm.label}
                </div>
                <div className="text-[10px] text-white/30 font-mono">{perm.key}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button
          onClick={() => router.push("/admin/roles")}
          type="button"
          variant="outline"
          className="flex-1 border-white/10 bg-transparent hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 bg-[#a67c52] hover:bg-[#956e47] text-white font-bold"
        >
          {pending ? "Saving..." : "Save Role"}
        </Button>
      </div>
    </form>
  );
}
