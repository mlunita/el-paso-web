"use client";

import { useActionState, useEffect, useState } from "react";
import { createWikiItemAsMod } from "@/app/mod/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Plus } from "lucide-react";
import { inspectWikiImageUrl } from "@/lib/wiki-image-url";

const SECTIONS = [
  { value: "GAMEPASS", label: "Gamepass" },
  { value: "WEAPONS", label: "Weapons" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "CARS", label: "Cars" },
  { value: "TEAMS", label: "Teams" },
];

export function ModWikiForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [state, formAction, pending] = useActionState(createWikiItemAsMod, null);
  const imageInspection = inspectWikiImageUrl(imageUrl);

  useEffect(() => {
    if (state?.success) {
      toast.success("Wiki item created successfully");
      router.push("/mod/wiki");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput("");
  };

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <input type="hidden" name="tags" value={tags.length > 0 ? JSON.stringify(tags) : ""} />
      <input type="hidden" name="customFields" value="" />

      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-400 font-bold">Title</Label>
        <Input id="title" name="title" required placeholder="e.g. VIP Gamepass" className="bg-black/50 border-white/10 focus-visible:ring-[#7ca982]/50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="section" className="text-zinc-400 font-bold">Section</Label>
        <select id="section" name="section" required className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#7ca982]/50">
          {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-400 font-bold">Description</Label>
        <Textarea id="description" name="description" required placeholder="Describe this item..." className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-[#7ca982]/50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-zinc-400 font-bold">Image URL (Optional)</Label>
        <Input id="image" name="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="bg-black/50 border-white/10 focus-visible:ring-[#7ca982]/50" />
        <p className={`text-xs ${imageInspection.issue ? "text-amber-300" : "text-white/40"}`}>
          {imageInspection.issue || "Use a permanent direct image URL. Discord media/share links with security tokens expire."}
        </p>
        {imageInspection.normalizedUrl && !imageInspection.issue && (
          <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
            <Image src={imageInspection.normalizedUrl} alt="Preview" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="order" className="text-zinc-400 font-bold">Display Order</Label>
        <Input id="order" name="order" type="number" required defaultValue={0} className="bg-black/50 border-white/10 focus-visible:ring-[#7ca982]/50" />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-zinc-400 font-bold">Tags (Optional)</Label>
        <div className="flex gap-2">
          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} placeholder="Type a tag..." className="bg-black/50 border-white/10 focus-visible:ring-[#7ca982]/50 flex-1" />
          <Button type="button" onClick={addTag} variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 px-3"><Plus className="w-4 h-4" /></Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7ca982]/20 text-[#9fcba5] text-xs font-semibold border border-[#7ca982]/20">
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/mod/wiki")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">Cancel</Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[#7ca982] hover:bg-[#6b9471] text-white font-bold">{pending ? "Saving..." : "Save Item"}</Button>
      </div>
    </form>
  );
}
