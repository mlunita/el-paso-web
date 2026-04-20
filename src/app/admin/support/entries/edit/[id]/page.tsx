import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SupportEntryForm } from "../../../entry-form";

export default async function EditSupportEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [entry, categories] = await Promise.all([
    prisma.supportEntry.findUnique({
      where: { id },
    }),
    prisma.supportCategory.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!entry) {
    return notFound();
  }

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Edit Support Entry</h1>
        <p className="text-zinc-500 text-sm mt-1">Adjust publishing state, custom byline text, or public visibility.</p>
      </div>
      <SupportEntryForm entry={entry} categories={categories} />
    </div>
  );
}
