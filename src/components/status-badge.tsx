"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/i18n-provider";
import { formatStatus } from "@/lib/i18n";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  UNDER_REVIEW: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  APPROVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  REJECTED: "bg-red-500/15 text-red-300 border-red-500/20",
  COMPLETED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  SUCCESSFUL: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  FAILED: "bg-red-600/15 text-red-400 border-red-600/20",
  ACTIVE: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  REVOKED: "bg-red-500/15 text-red-300 border-red-500/20",
  EXPIRED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const style = STATUS_STYLES[status] || "bg-zinc-500/15 text-zinc-300 border-zinc-500/20";
  return (
    <Badge className={`${style} border font-bold text-[10px] tracking-wider uppercase`}>
      {formatStatus(status, t)}
    </Badge>
  );
}
