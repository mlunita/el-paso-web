import { prisma } from "@/lib/prisma";
import { StaffForm } from "../../client-form";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/server";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations();
  const member = await prisma.staffMember.findUnique({
    where: { id }
  });

  if (!member) return notFound();

  // Serialize for client component
  const serialized = {
    id: member.id,
    name: member.name,
    role: member.role,
    image: member.image,
    discordId: member.discordId,
    order: member.order,
  };

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.staff.editTitle}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t.admin.staff.editSubtitle}</p>
      </div>
      <StaffForm member={serialized} />
    </div>
  );
}
