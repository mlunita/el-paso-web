import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { EvidenceGallery } from "@/components/evidence-gallery";
import { BanRequestStatusChanger, AddNoteForm } from "../client-actions";
import Link from "next/link";
import { ArrowLeft, User, Shield, Clock, FileText } from "lucide-react";

export default async function BanRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.banRequest.findUnique({
    where: { id },
    include: {
      token: { include: { role: true } },
      evidence: { orderBy: { createdAt: "asc" } },
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!request) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/hq/ban-requests"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ban Requests
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black">Ban Request</h1>
          <StatusBadge status={request.status} />
        </div>
        <p className="text-white/30 text-sm mt-1">ID: {request.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target info */}
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

          {/* Reason & Notes */}
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
                <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Moderator Notes</div>
                <p className="text-white/60 text-sm">{request.notes}</p>
              </div>
            )}
            {request.adminNotes && (
              <div>
                <div className="text-xs text-white/30 uppercase tracking-wider mb-1">Admin Notes</div>
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

          {/* Audit Trail */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Audit Trail
            </h2>
            <div className="space-y-3">
              {request.auditLogs.length === 0 && (
                <p className="text-white/30 text-sm italic">No audit entries yet.</p>
              )}
              {request.auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-black/20">
                  <div className="w-2 h-2 rounded-full bg-[#a67c52] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-white/80">{log.action.replace(/_/g, " ")}</span>
                      {log.fromStatus && log.toStatus && (
                        <span className="text-white/40 text-xs">
                          {log.fromStatus} → {log.toStatus}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">
                      by {log.performedBy} · {new Date(log.createdAt).toLocaleString()}
                    </div>
                    {log.details && (
                      <p className="text-xs text-white/50 mt-1">{log.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Moderator info */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Moderator Info
            </h2>
            <div>
              <div className="text-xs text-white/30">Name</div>
              <div className="font-bold">{request.modName}</div>
            </div>
            <div>
              <div className="text-xs text-white/30">ID</div>
              <div className="font-mono text-sm text-white/70">{request.modId}</div>
            </div>
            <div>
              <div className="text-xs text-white/30">Role</div>
              <div className="text-[#c9a87c] font-semibold">{request.modRole}</div>
            </div>
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
          </div>

          {/* Status changer */}
          <BanRequestStatusChanger requestId={request.id} currentStatus={request.status} />

          {/* Add note */}
          <AddNoteForm requestId={request.id} />
        </div>
      </div>
    </div>
  );
}
