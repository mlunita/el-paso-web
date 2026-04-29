"use client";

import { useActionState, useEffect, useState } from "react";
import { createBanRequest } from "@/app/mod/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, X, ImageIcon, Video } from "lucide-react";

type EvidenceItem = {
  type: "IMAGE" | "VIDEO";
  url: string;
  caption: string;
};

export function BanRequestForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createBanRequest, null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceType, setEvidenceType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [evidenceCaption, setEvidenceCaption] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Ban request submitted successfully");
      router.push("/mod/ban-requests");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const addEvidence = () => {
    if (!evidenceUrl.trim()) return;
    setEvidence([...evidence, { type: evidenceType, url: evidenceUrl.trim(), caption: evidenceCaption.trim() }]);
    setEvidenceUrl("");
    setEvidenceCaption("");
  };

  const removeEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      {/* Hidden evidence JSON field */}
      <input type="hidden" name="evidence" value={evidence.length > 0 ? JSON.stringify(evidence) : ""} />

      <div className="space-y-2">
        <Label htmlFor="targetUserId" className="text-zinc-400 font-bold">Target User ID</Label>
        <Input
          id="targetUserId"
          name="targetUserId"
          required
          placeholder="e.g. roblox:12345678"
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-secondary)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetUsername" className="text-zinc-400 font-bold">Target Username</Label>
        <Input
          id="targetUsername"
          name="targetUsername"
          required
          placeholder="e.g. PlayerName123"
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-secondary)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-zinc-400 font-bold">Reason for Ban</Label>
        <Textarea
          id="reason"
          name="reason"
          required
          placeholder="Describe the reason for this ban request..."
          className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-[var(--ep-secondary)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-zinc-400 font-bold">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional context..."
          className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-[var(--ep-secondary)]/50"
        />
      </div>

      {/* Evidence Section */}
      <div className="space-y-3">
        <Label className="text-zinc-400 font-bold">Evidence (Optional)</Label>
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
          <div className="flex gap-2">
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as "IMAGE" | "VIDEO")}
              className="h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white text-sm"
            >
              <option value="IMAGE">📷 Image</option>
              <option value="VIDEO">🎥 Video</option>
            </select>
            <Input
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="Paste URL..."
              className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-secondary)]/50 flex-1"
            />
            <Button type="button" onClick={addEvidence} variant="outline" className="border-white/10 bg-transparent hover:bg-white/5 px-3">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Input
            value={evidenceCaption}
            onChange={(e) => setEvidenceCaption(e.target.value)}
            placeholder="Caption (optional)..."
            className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-secondary)]/50"
          />

          {evidence.length > 0 && (
            <div className="space-y-2 mt-3">
              {evidence.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                  {item.type === "IMAGE" ? (
                    <ImageIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  ) : (
                    <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{item.url}</p>
                    {item.caption && (
                      <p className="text-[10px] text-white/40 truncate">{item.caption}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvidence(i)}
                    className="hover:text-red-400 transition-colors text-white/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--ep-secondary)]/10 border border-[var(--ep-secondary)]/15">
        <div className="w-2 h-2 rounded-full bg-[var(--ep-secondary)] mt-1.5 flex-shrink-0" />
        <p className="text-xs text-[var(--ep-secondary)]/80">
          Your moderator identity will be automatically attached to this request.
          You cannot modify the submitter information.
        </p>
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button
          onClick={() => router.push("/mod/ban-requests")}
          type="button"
          variant="outline"
          className="flex-1 border-white/10 bg-transparent hover:bg-white/5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="flex-1 bg-[var(--ep-secondary)] hover:bg-[#6b9471] text-white font-bold"
        >
          {pending ? "Submitting..." : "Submit Ban Request"}
        </Button>
      </div>
    </form>
  );
}
