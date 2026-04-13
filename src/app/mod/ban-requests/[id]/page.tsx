import { getModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { EvidenceGallery } from "@/components/evidence-gallery";
import Link from "next/link";
import { ArrowLeft, User, FileText, Clock } from "lucide-react";

export default async function ModBanRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getModSession();
  if (!session) redirect("/mod-login");

  const { id } = await params;

  const request = await prisma.banRequest.findUnique({
    where: { id },
    include: {
      evidence: { orderBy: { createdAt: "asc" } },
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!request || request.tokenId !== session.tokenId) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/mod/ban-requests"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Requests
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black">Ban Request</h1>
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Target */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              Target User
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider">Username</div>
                <div className="font-bold text-lg">{request.targetUsername}</div>
              </div>
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider">User ID</div>
                <div className="font-mono text-white/70">{request.targetUserId}</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Details
            </h2>
            <div>
              <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Reason</div>
              <p className="text-white/80">{request.reason}</p>
            </div>
            {request.notes && (
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Your Notes</div>
                <p className="text-white/60 text-sm">{request.notes}</p>
              </div>
            )}
            {request.adminNotes && (
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Admin Response</div>
                <pre className="text-white/60 text-sm whitespace-pre-wrap bg-black/30 p-3 rounded-lg font-sans">
                  {request.adminNotes}
                </pre>
              </div>
            )}
          </div>

          {/* Evidence */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">
              Evidence ({request.evidence.length})
            </h2>
            <EvidenceGallery evidence={request.evidence} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </h2>
            <div>
              <div className="text-xs text-white/30">Submitted</div>
              <div className="text-sm text-white/60">{new Date(request.createdAt).toLocaleString()}</div>
            </div>
            {request.reviewedAt && (
              <div>
                <div className="text-xs text-white/30">Reviewed</div>
                <div className="text-sm text-white/60">{new Date(request.reviewedAt).toLocaleString()}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-white/30">Current Status</div>
              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          {/* Status history */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">History</h2>
            <div className="space-y-2">
              {request.auditLogs.length === 0 && (
                <p className="text-white/30 text-sm italic">No history entries.</p>
              )}
              {request.auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg bg-black/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7ca982] mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white/70">{log.action.replace(/_/g, " ")}</div>
                    {log.fromStatus && log.toStatus && (
                      <div className="text-[10px] text-white/40">{log.fromStatus} → {log.toStatus}</div>
                    )}
                    <div className="text-[10px] text-white/30 mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
