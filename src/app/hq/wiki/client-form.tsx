"use client";

import { useActionState, useEffect, useState } from "react";
import { createWikiItem, updateWikiItem } from "@/app/hq/actions";
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

// Section-specific optional fields — easily extensible
const SECTION_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  CARS: [
    { key: "mileage", label: "Mileage", placeholder: "e.g. 50,000 miles" },
  ],
  // Add more sections here in the future, e.g.:
  // WEAPONS: [{ key: "damage", label: "Damage", placeholder: "e.g. 50 HP" }],
};

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function parseCustomFields(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export function WikiForm({ item }: { item?: any }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(item?.image || "");
  const [selectedSection, setSelectedSection] = useState(item?.section || "GAMEPASS");
  const imageInspection = inspectWikiImageUrl(imageUrl);

  // Tags state
  const [tags, setTags] = useState<string[]>(parseTags(item?.tags));
  const [tagInput, setTagInput] = useState("");

  // Custom fields state
  const [customFields, setCustomFields] = useState<Record<string, string>>(
    parseCustomFields(item?.customFields)
  );

  const updateFn = item ? updateWikiItem.bind(null, item.id) : createWikiItem;
  const [state, formAction, pending] = useActionState(updateFn, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(item ? "Wiki item updated successfully" : "Wiki item created successfully");
      router.push("/hq/wiki");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, item]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const sectionFields = SECTION_FIELDS[selectedSection] || [];

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      {/* Hidden fields for tags and customFields JSON */}
      <input type="hidden" name="tags" value={tags.length > 0 ? JSON.stringify(tags) : ""} />
      <input type="hidden" name="customFields" value={Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : ""} />

      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-400 font-bold">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={item?.title}
          placeholder="e.g. VIP Gamepass"
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="section" className="text-zinc-400 font-bold">Section</Label>
        <select
          id="section"
          name="section"
          required
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--ep-accent)]/50"
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
          className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
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
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
        <p className={`text-xs ${imageInspection.issue ? "text-amber-300" : "text-zinc-500"}`}>
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
        <Input
          id="order"
          name="order"
          type="number"
          required
          defaultValue={item?.order || 0}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <Label className="text-zinc-400 font-bold">Tags (Optional)</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter..."
            className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50 flex-1"
          />
          <Button type="button" onClick={addTag} variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 px-3">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--ep-accent)]/20 text-[var(--ep-accent-hover)] text-xs font-semibold border border-[var(--ep-accent)]/20"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Section-Specific Fields */}
      {sectionFields.length > 0 && (
        <div className="space-y-4 p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
          <div className="text-xs font-bold uppercase tracking-widest text-white/30">
            {selectedSection} — Optional Fields
          </div>
          {sectionFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`cf-${field.key}`} className="text-zinc-400 font-bold">{field.label}</Label>
              <Input
                id={`cf-${field.key}`}
                value={customFields[field.key] || ""}
                onChange={(e) =>
                  setCustomFields((prev) => {
                    const next = { ...prev };
                    if (e.target.value) {
                      next[field.key] = e.target.value;
                    } else {
                      delete next[field.key];
                    }
                    return next;
                  })
                }
                placeholder={field.placeholder}
                className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
              />
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/hq/wiki")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[var(--ep-accent)] hover:bg-[#956e47] text-white font-bold">
          {pending ? "Saving..." : "Save Item"}
        </Button>
      </div>
    </form>
  );
}
