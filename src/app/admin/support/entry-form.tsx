"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupportEntry, updateSupportEntry } from "@/app/admin/actions";
import { SUPPORT_ENTRY_STATUS_OPTIONS, SUPPORT_ENTRY_VISIBILITY_OPTIONS } from "@/lib/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toDateTimeLocal(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (segment: number) => `${segment}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type SupportEntryFormProps = {
  entry?: any;
  categories: { id: string; name: string; slug: string }[];
};

export function SupportEntryForm({ entry, categories }: SupportEntryFormProps) {
  const router = useRouter();
  const action = entry ? updateSupportEntry.bind(null, entry.id) : createSupportEntry;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(entry ? "Entry updated successfully" : "Entry created successfully");
      router.push("/admin/support");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [entry, router, state]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-3xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-400 font-bold">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={entry?.title}
          placeholder="e.g. Ticket response times"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="text-zinc-400 font-bold">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={entry?.slug || ""}
          placeholder="Generated from the title if left blank"
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
        <p className="text-xs text-zinc-500">Used in the public URL.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="text-zinc-400 font-bold">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={entry?.categoryId || categories[0]?.id || ""}
            className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#a67c52]/50"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorName" className="text-zinc-400 font-bold">Author Name</Label>
          <Input
            id="authorName"
            name="authorName"
            required
            defaultValue={entry?.authorName || ""}
            placeholder="e.g. Community Operations"
            className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
          />
          <p className="text-xs text-zinc-500">This is stored as the exact public byline text.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-zinc-400 font-bold">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={entry?.status || "DRAFT"}
            className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#a67c52]/50"
          >
            {SUPPORT_ENTRY_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility" className="text-zinc-400 font-bold">Visibility</Label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={entry?.visibility || "PUBLIC"}
            className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#a67c52]/50"
          >
            {SUPPORT_ENTRY_VISIBILITY_OPTIONS.map((option) => (
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
            defaultValue={entry?.order ?? 0}
            className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="publishDate" className="text-zinc-400 font-bold">Publish Date</Label>
        <Input
          id="publishDate"
          name="publishDate"
          type="datetime-local"
          defaultValue={toDateTimeLocal(entry?.publishedAt)}
          className="bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
        <p className="text-xs text-zinc-500">Optional. If the entry is published and this is blank, the current time will be used.</p>
      </div>

      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-6 text-zinc-400">
        Public archive visibility rule: only entries marked `PUBLISHED` and `PUBLIC` appear in the main `/support` listing right away.
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          defaultChecked={entry?.featured}
          className="w-5 h-5 rounded border-white/10 bg-black/50 accent-[#a67c52]"
        />
        <Label htmlFor="featured" className="text-zinc-300 font-bold cursor-pointer">Feature this entry</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-zinc-400 font-bold">Content</Label>
        <Textarea
          id="content"
          name="content"
          required
          defaultValue={entry?.content}
          placeholder="Write the article, FAQ answer, or newsroom note here."
          className="min-h-[260px] bg-black/50 border-white/10 focus-visible:ring-[#a67c52]/50"
        />
        <p className="text-xs text-zinc-500">Plain text is supported. Lines starting with `#` or `##` will render as headings on the public page.</p>
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/admin/support")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[#a67c52] hover:bg-[#956e47] text-white font-bold">
          {pending ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}
