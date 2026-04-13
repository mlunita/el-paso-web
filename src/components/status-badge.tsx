import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
  UNDER_REVIEW: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  APPROVED: "bg-green-500/20 text-green-300 border-green-500/20",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/20",
  COMPLETED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
  SUCCESSFUL: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
  FAILED: "bg-red-600/20 text-red-400 border-red-600/20",
  ACTIVE: "bg-green-500/20 text-green-300 border-green-500/20",
  REVOKED: "bg-red-500/20 text-red-300 border-red-500/20",
  EXPIRED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/20",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || "bg-zinc-500/20 text-zinc-300 border-zinc-500/20";
  return (
    <Badge className={`${style} border font-bold text-[10px] tracking-wider uppercase`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
