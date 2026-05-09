"use client";

import { useTransition } from "react";
import { adminResetAllShifts } from "@/app/hq/moderation-actions";
import { AlertTriangle } from "lucide-react";

export default function ShiftResetClient() {
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    if (!confirm("Are you SURE you want to reset ALL shift data? This action CANNOT be undone.")) return;
    startTransition(async () => {
      await adminResetAllShifts();
      alert("All shift data has been successfully reset.");
    });
  };

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[var(--ep-border)]">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold tracking-tight">
          Reset <span className="text-white/20 font-medium text-lg ml-2">Shifts</span>
        </h1>
        <p className="text-white/30 text-sm mt-1.5">
          Danger zone: Delete all shift data for all users.
        </p>
      </div>

      <div className="p-8 rounded-xl border border-red-500/20 bg-red-500/5 max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-lg font-bold text-red-500">Reset All Shift Data</h2>
        </div>
        <p className="text-white/70 text-sm mb-6">
          This will permanently delete all shift history and break records for every moderator. Only do this if you need to start fresh for a new week or month.
        </p>
        <button
          onClick={handleReset}
          disabled={isPending}
          className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? "Resetting..." : "Confirm Reset"}
        </button>
      </div>
    </div>
  );
}
