import { prisma } from "@/lib/prisma";
import { TokenForm } from "../client-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function CreateTokenPage() {
  const t = await getTranslations();
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.tokens.createTitle}</h1>
        <p className="text-white/30 text-sm mt-1">
          {t.admin.tokens.createSubtitle}
        </p>
      </div>
      <TokenForm roles={roles} />
    </div>
  );
}
