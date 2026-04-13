"use client";

import { useActionState, useEffect } from "react";
import { createStaff, updateStaff } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function StaffForm({ member }: { member?: any }) {
  const router = useRouter();
  const updateFn = member ? updateStaff.bind(null, member.id) : createStaff;
  const [state, formAction, pending] = useActionState(updateFn, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(member ? "Staff member updated successfully" : "Staff member created successfully");
      router.push("/admin/staff");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, member]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-400 font-bold">Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={member?.name}
          placeholder="e.g. John Doe"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-zinc-400 font-bold">Role / Title</Label>
        <Input
          id="role"
          name="role"
          required
          defaultValue={member?.role}
          placeholder="e.g. Server Director"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-zinc-400 font-bold">Avatar Image URL (Optional)</Label>
        <Input
          id="image"
          name="image"
          defaultValue={member?.image || ""}
          placeholder="https://example.com/avatar.jpg"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order" className="text-zinc-400 font-bold">Display Order</Label>
        <Input
          id="order"
          name="order"
          type="number"
          required
          defaultValue={member?.order || 0}
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/admin/staff")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[#a67c52] hover:bg-[#956e47] text-white font-bold">
          {pending ? "Saving..." : "Save Member"}
        </Button>
      </div>
    </form>
  );
}
