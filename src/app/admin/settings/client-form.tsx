"use client";

import { useActionState, useEffect } from "react";
import { updateSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SettingsForm({ defaultValues }: { defaultValues: any }) {
  const [state, formAction, isPending] = useActionState(updateSettings, null);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      {state?.success && (
        <div className="bg-green-500/20 text-green-200 p-3 rounded-lg border border-green-500/50">
          Settings updated successfully!
        </div>
      )}
      {state?.error && (
        <div className="bg-red-500/20 text-red-200 p-3 rounded-lg border border-red-500/50">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Banner Image URL (Optional)</Label>
        <Input 
          name="bannerImage" 
          defaultValue={defaultValues?.bannerImage || ""} 
          className="bg-black/20 border-white/10"
          placeholder="https://example.com/banner.jpg"
        />
        {defaultValues?.bannerImage && (
          <div className="mt-2 text-sm text-zinc-500">
            <img src={defaultValues.bannerImage} className="w-full h-32 object-cover rounded-md opacity-80" alt="Banner Preview" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Banner Title</Label>
        <Input 
          name="bannerTitle" 
          defaultValue={defaultValues?.bannerTitle || ""} 
          required 
          className="bg-black/20 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label>Banner Subtitle</Label>
        <Input 
          name="bannerSubtitle" 
          defaultValue={defaultValues?.bannerSubtitle || ""} 
          required 
          className="bg-black/20 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label>Short Description</Label>
        <Textarea 
          name="description" 
          defaultValue={defaultValues?.description || ""} 
          required 
          className="bg-black/20 border-white/10"
        />
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          id="appsOpen" 
          name="appsOpen" 
          defaultChecked={defaultValues?.appsOpen ?? true} 
          className="w-5 h-5 accent-[#8b5cf6]"
        />
        <Label htmlFor="appsOpen" className="text-lg">Applications Open</Label>
      </div>

      <Button type="submit" disabled={isPending} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-lg py-6 max-w-xs border-0 text-white">
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
