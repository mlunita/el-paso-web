import { prisma } from "@/lib/prisma";
import { SupportEntryForm } from "../../entry-form";

export default async function CreateSupportEntryPage() {
  const categories = await prisma.supportCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Create Support Entry</h1>
        <p className="text-zinc-500 text-sm mt-1">Write a discreet article, answer, or support note for the public archive.</p>
      </div>

      {categories.length === 0 ? (
        <div className="max-w-2xl rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-zinc-400">
          Create at least one support category before adding entries.
        </div>
      ) : (
        <SupportEntryForm categories={categories} />
      )}
    </div>
  );
}
