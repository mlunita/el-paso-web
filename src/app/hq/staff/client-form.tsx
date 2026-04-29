"use client";

import { useActionState, useEffect } from "react";
import { createStaff, updateStaff } from "@/app/hq/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

export function StaffForm({ member }: { member?: any }) {
  const router = useRouter();
  const { t } = useI18n();
  const updateFn = member ? updateStaff.bind(null, member.id) : createStaff;
  const [state, formAction, pending] = useActionState(updateFn, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(member ? t.admin.staff.toastUpdated : t.admin.staff.toastCreated);
      router.push("/hq/staff");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, member]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-400 font-bold">{t.admin.staff.name}</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={member?.name}
          placeholder={t.admin.staff.placeholders.name}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-zinc-400 font-bold">{t.admin.staff.roleTitle}</Label>
        <Input
          id="role"
          name="role"
          required
          defaultValue={member?.role}
          placeholder={t.admin.staff.placeholders.role}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-zinc-400 font-bold">{t.admin.staff.avatarUrl}</Label>
        <Input
          id="image"
          name="image"
          defaultValue={member?.image || ""}
          placeholder="https://example.com/avatar.jpg"
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order" className="text-zinc-400 font-bold">{t.admin.staff.displayOrder}</Label>
        <Input
          id="order"
          name="order"
          type="number"
          required
          defaultValue={member?.order || 0}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/hq/staff")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[var(--ep-accent)] hover:bg-[#956e47] text-white font-bold">
          {pending ? t.common.saving : t.admin.staff.saveMember}
        </Button>
      </div>
    </form>
  );
}
