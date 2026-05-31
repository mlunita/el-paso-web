import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { SubmissionsClient } from "./submissions-client";
import { Button } from "@/components/ui/button";

export default async function SpecialRequestSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  const form = await prisma.specialRequestForm.findUnique({
    where: { id },
    include: {
      submissions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!form) return notFound();

  let fields = [];
  try { fields = JSON.parse(form.fields); } catch(e) {}

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <Link href="/hq/special-requests" className="inline-flex items-center text-[var(--ep-text-muted)] hover:text-white transition-colors mb-6 text-sm font-bold">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Forms
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
            {form.title} Submissions
          </h1>
          <p className="text-[var(--ep-text-muted)] text-sm">
            Total Submissions: {form.submissions.length}
          </p>
        </div>
        <Link href={`/hq/special-requests/edit/${form.id}`}>
          <Button variant="outline" className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] hover:bg-[var(--ep-bg-hover)] text-white font-bold">
            <Edit className="w-4 h-4 mr-2" />
            Edit Form
          </Button>
        </Link>
      </div>

      <SubmissionsClient formId={form.id} submissions={form.submissions} fields={fields} />
    </div>
  );
}
