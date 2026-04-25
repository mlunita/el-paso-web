import { prisma } from "@/lib/prisma";
import { WikiForm } from "../../client-form";
import { notFound } from "next/navigation";

export default async function EditWikiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.wikiItem.findUnique({
    where: { id }
  });

  if (!item) return notFound();

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Edit Wiki Item</h1>
        <p className="text-zinc-500 text-sm mt-1">Update this wiki item&apos;s details.</p>
      </div>
      <WikiForm item={item} />
    </div>
  );
}
