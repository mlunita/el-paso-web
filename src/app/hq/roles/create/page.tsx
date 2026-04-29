import { prisma } from "@/lib/prisma";
import { RoleForm } from "../client-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function CreateRolePage() {
  const t = await getTranslations();
  const allPermissions = await prisma.permission.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.roles.createTitle}</h1>
        <p className="text-white/30 text-sm mt-1">{t.admin.roles.createSubtitle}</p>
      </div>
      <RoleForm allPermissions={allPermissions} />
    </div>
  );
}
