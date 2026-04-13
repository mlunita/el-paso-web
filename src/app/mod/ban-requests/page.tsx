import { getModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

export default async function ModBanRequestsPage() {
  const session = await getModSession();
  if (!session) redirect("/mod-login");

  // Check permission
  if (!session.permissions.includes("create_ban_requests") && !session.permissions.includes("view_own_ban_requests")) {
    return (
      <div className="text-center py-16 text-white/50">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400/50" />
        <p className="font-bold">Access Denied</p>
        <p className="text-sm mt-1">You don&apos;t have permission to view ban requests.</p>
      </div>
    );
  }

  const requests = await prisma.banRequest.findMany({
    where: { tokenId: session.tokenId },
    include: { _count: { select: { evidence: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#7ca982]" />
            My Ban Requests
          </h1>
          <p className="text-white/30 text-sm mt-1">Track your submitted ban requests and their status</p>
        </div>
        {session.permissions.includes("create_ban_requests") && (
          <Link
            href="/mod/ban-requests/create"
            className="flex items-center gap-2 bg-[#7ca982] hover:bg-[#6b9471] text-white py-2 px-4 rounded-lg font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Target</TableHead>
              <TableHead className="text-white font-bold">Reason</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Evidence</TableHead>
              <TableHead className="text-white font-bold">Date</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={6} className="text-center py-8 text-white/50">
                  No ban requests yet. Submit your first request.
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
                  <StatusBadge status={req.status} />
                </TableCell>
                <TableCell className="text-white/50 text-sm">{req._count.evidence}</TableCell>
                <TableCell className="text-white/40 text-xs">
                  {new Date(req.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/mod/ban-requests/${req.id}`}
                    className="px-3 py-1.5 bg-[#7ca982]/80 hover:bg-[#7ca982] text-white text-xs font-medium rounded-md shadow-sm"
                  >
                    View
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
