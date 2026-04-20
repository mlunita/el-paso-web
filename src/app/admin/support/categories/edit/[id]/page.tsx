import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SupportCategoryForm } from "../../../category-form";

export default async function EditSupportCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.supportCategory.findUnique({
    where: { id },
  });

  if (!category) {
    return notFound();
  }

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Edit Support Category</h1>
        <p className="text-zinc-500 text-sm mt-1">Update the section name, ordering, or public visibility.</p>
      </div>
      <SupportCategoryForm category={category} />
    </div>
  );
}
