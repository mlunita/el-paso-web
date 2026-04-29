import { StaffForm } from "../client-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function CreateStaffPage() {
  const t = await getTranslations();
  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.staff.createTitle}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t.admin.staff.createSubtitle}</p>
      </div>
      <StaffForm />
    </div>
  );
}
