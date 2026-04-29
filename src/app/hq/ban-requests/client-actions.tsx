"use client";

import { useState } from "react";
import { updateBanRequestStatus, addBanRequestNote } from "@/app/hq/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STATUS_OPTIONS = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "SUCCESSFUL",
  "FAILED",
];

export function BanRequestStatusChanger({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async () => {
    if (newStatus === currentStatus && !notes) return;
    setLoading(true);
    try {
      await updateBanRequestStatus(requestId, newStatus, notes || undefined);
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      setNotes("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
      <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Update Status</h3>
      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--ep-accent)]/50"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add review notes (optional)..."
        className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
      />
      <Button
        onClick={handleStatusChange}
        disabled={loading || (newStatus === currentStatus && !notes)}
        className="w-full bg-[var(--ep-accent)] hover:bg-[#956e47] text-white font-bold"
      >
        {loading ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}

export function AddNoteForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await addBanRequestNote(requestId, note.trim());
      toast.success("Note added");
      setNote("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
      <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Add Note</h3>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write an internal note..."
        className="min-h-[60px] bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
      />
      <Button
        onClick={handleSubmit}
        disabled={loading || !note.trim()}
        className="w-full bg-white/10 hover:bg-white/15 text-white font-bold"
      >
        {loading ? "Adding..." : "Add Note"}
      </Button>
    </div>
  );
}
