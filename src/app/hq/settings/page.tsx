import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./client-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const t = await getTranslations();
  const settings = await prisma.siteSettings.findFirst();

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 border-b border-white/20 pb-4">{t.admin.settings.title}</h1>
      <SettingsForm defaultValues={settings} />
    </div>
  );
}
