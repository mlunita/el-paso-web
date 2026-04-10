"use client";

import { useActionState, useEffect, useState } from "react";
import { createWikiItem, updateWikiItem } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SECTIONS = [
  { value: "GAMEPASS", label: "Gamepass" },
  { value: "WEAPONS", label: "Weapons" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "CARS", label: "Cars" },
];

export function WikiForm({ item }: { item?: any }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(item?.image || "");

  const updateFn = item ? updateWikiItem.bind(null, item.id) : createWikiItem;
  const [state, formAction, pending] = useActionState(updateFn, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(item ? "Wiki item updated successfully" : "Wiki item created successfully");
      router.push("/admin/wiki");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, item]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-400 font-bold">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={item?.title}
          placeholder="e.g. VIP Gamepass"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="section" className="text-zinc-400 font-bold">Section</Label>
        <select
          id="section"
          name="section"
          required
          defaultValue={item?.section || "GAMEPASS"}
          className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#a67c52]/50"
        >
          {SECTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-400 font-bold">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={item?.description}
          placeholder="Describe this item..."
          className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-zinc-400 font-bold">Image URL (Optional)</Label>
        <Input
          id="image"
          name="image"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
        {imageUrl && (
          <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="order" className="text-zinc-400 font-bold">Display Order</Label>
        <Input
          id="order"
          name="order"
          type="number"
          required
          defaultValue={item?.order || 0}
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/admin/wiki")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[#a67c52] hover:bg-[#956e47] text-white font-bold">
          {pending ? "Saving..." : "Save Item"}
        </Button>
      </div>
    </form>
  );
}
