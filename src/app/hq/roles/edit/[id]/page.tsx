import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RoleForm } from "../../client-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations();
  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  });

  if (!role) notFound();

  const allPermissions = await prisma.permission.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.roles.editTitle}</h1>
        <p className="text-white/30 text-sm mt-1">
          {t.common.editing(role.name)}
        </p>
      </div>
      <RoleForm role={role} allPermissions={allPermissions} />
    </div>
  );
}
