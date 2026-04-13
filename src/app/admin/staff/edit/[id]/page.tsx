import { prisma } from "@/lib/prisma";
import { StaffForm } from "../../client-form";
import { notFound } from "next/navigation";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.staffMember.findUnique({
    where: { id }
  });

  if (!member) return notFound();

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Edit Staff Member</h1>
        <p className="text-zinc-500 text-sm mt-1">Update role or avatar.</p>
      </div>
      <StaffForm member={member} />
    </div>
  );
}
