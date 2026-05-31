import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, Settings, Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SpecialRequestsHQPage() {
  await requireAdminSession();

  const forms = await prisma.specialRequestForm.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { submissions: true },
      },
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
            Special Requests
          </h1>
          <p className="text-[var(--ep-text-muted)] text-sm">
            Manage dynamic forms and view user submissions.
          </p>
        </div>
        <Link href="/hq/special-requests/create">
          <Button className="bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)] text-black font-bold">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Form
          </Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="ep-card-elevated rounded-xl p-12 text-center border-[var(--ep-border)]">
          <div className="bg-[var(--ep-bg-hover)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--ep-border)]">
            <Settings className="w-8 h-8 text-[var(--ep-text-muted)]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Forms Found</h3>
          <p className="text-[var(--ep-text-muted)] max-w-md mx-auto">
            You haven't created any special request forms yet. Create one to start accepting custom submissions from the community.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="ep-card-elevated rounded-xl p-6 border-[var(--ep-border)] flex flex-col h-full transition-all hover:border-[var(--ep-accent)]/50 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${form.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {form.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {form.isActive ? "ACTIVE" : "INACTIVE"}
                </div>
                <div className="text-xs font-medium bg-[var(--ep-bg-hover)] px-2.5 py-1 rounded-full border border-[var(--ep-border)] text-[var(--ep-text-muted)]">
                  {form._count.submissions} Submissions
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{form.title}</h3>
              <p className="text-[var(--ep-text-muted)] text-sm mb-6 flex-grow line-clamp-2">
                {form.description || "No description provided."}
              </p>
              
              <div className="flex gap-3 mt-auto">
                <Link href={`/hq/special-requests/${form.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-[var(--ep-bg-deep)] border-[var(--ep-border)] hover:bg-[var(--ep-bg-hover)] text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    View Data
                  </Button>
                </Link>
                <Link href={`/hq/special-requests/edit/${form.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-[var(--ep-bg-deep)] border-[var(--ep-border)] hover:bg-[var(--ep-bg-hover)] text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Form
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
