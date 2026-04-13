import { prisma } from "@/lib/prisma";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { AlertTriangle, Search, Filter } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

export default async function BanRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; mod?: string; target?: string }>;
}) {
  const params = await searchParams;

  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.mod) {
    where.OR = [
      { modName: { contains: params.mod, mode: "insensitive" } },
      { modId: { contains: params.mod, mode: "insensitive" } },
    ];
  }
  if (params.target) {
    where.OR = [
      ...(where.OR || []),
      { targetUsername: { contains: params.target, mode: "insensitive" } },
      { targetUserId: { contains: params.target, mode: "insensitive" } },
    ];
  }

  const requests = await prisma.banRequest.findMany({
    where,
    include: {
      token: { include: { role: true } },
      _count: { select: { evidence: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "COMPLETED", "FAILED"];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#a67c52]" />
            Ban Requests
          </h1>
          <p className="text-white/30 text-sm mt-1">Review and manage all moderator ban requests</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/30" />
          <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Filters</span>
        </div>
        <select
          name="status"
          defaultValue={params.status || ""}
          className="h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-sm"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <input
          name="mod"
          defaultValue={params.mod || ""}
          placeholder="Search moderator..."
          className="h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-white/30 w-48"
        />
        <input
          name="target"
          defaultValue={params.target || ""}
          placeholder="Search target user..."
          className="h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-sm placeholder:text-white/30 w-48"
        />
        <button
          type="submit"
          className="h-9 px-4 rounded-lg bg-[#a67c52]/80 hover:bg-[#a67c52] text-white text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          Filter
        </button>
        <Link
          href="/admin/ban-requests"
          className="h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-bold transition-colors flex items-center"
        >
          Clear
        </Link>
      </form>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Target</TableHead>
              <TableHead className="text-white font-bold">Reason</TableHead>
              <TableHead className="text-white font-bold">Moderator</TableHead>
              <TableHead className="text-white font-bold">Role</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Evidence</TableHead>
              <TableHead className="text-white font-bold">Date</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={8} className="text-center py-8 text-white/50">
                  No ban requests found.
                </TableCell>
              </TableRow>
            )}
            {requests.map((req) => (
              <TableRow key={req.id} className="border-white/10 hover:bg-white/5">
                <TableCell>
                  <div>
                    <div className="font-bold text-sm">{req.targetUsername}</div>
                    <div className="text-xs text-white/40 font-mono">{req.targetUserId}</div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <p className="text-sm text-white/70 truncate">{req.reason}</p>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold text-sm">{req.modName}</div>
                    <div className="text-xs text-white/40 font-mono">{req.modId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[#c9a87c] font-semibold text-xs">{req.modRole}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={req.status} />
                </TableCell>
                <TableCell className="text-white/50 text-sm">{req._count.evidence}</TableCell>
                <TableCell className="text-white/40 text-xs">
                  {new Date(req.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/ban-requests/${req.id}`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm"
                  >
                    Review
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
