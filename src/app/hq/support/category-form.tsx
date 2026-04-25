"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupportCategory, updateSupportCategory } from "@/app/hq/actions";
import { SUPPORT_CATEGORY_VISIBILITY_OPTIONS } from "@/lib/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupportCategoryForm({ category }: { category?: any }) {
  const router = useRouter();
  const action = category ? updateSupportCategory.bind(null, category.id) : createSupportCategory;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(category ? "Category updated successfully" : "Category created successfully");
      router.push("/hq/support");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [category, router, state]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-400 font-bold">Category Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={category?.name}
          placeholder="e.g. Account Help"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="text-zinc-400 font-bold">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={category?.slug || ""}
          placeholder="Generated from the category name if left blank"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
        <p className="text-xs text-zinc-500">Used in the public URL.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-400 font-bold">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={category?.description || ""}
          placeholder="A short, quiet description for the section."
          className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="visibility" className="text-zinc-400 font-bold">Visibility</Label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={category?.visibility || "PUBLIC"}
            className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#a67c52]/50"
          >
            {SUPPORT_CATEGORY_VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order" className="text-zinc-400 font-bold">Display Order</Label>
          <Input
            id="order"
            name="order"
            type="number"
            required
            defaultValue={category?.order ?? 0}
            className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
          />
        </div>
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/hq/support")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[#a67c52] hover:bg-[#956e47] text-white font-bold">
          {pending ? "Saving..." : "Save Category"}
        </Button>
      </div>
    </form>
  );
}
