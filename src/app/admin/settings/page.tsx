import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./client-form";

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findFirst();

  return (
    <div>
      <h1 className="text-3xl font-black mb-8 border-b border-white/20 pb-4">Site Settings</h1>
      <SettingsForm defaultValues={settings} />
    </div>
  );
}
