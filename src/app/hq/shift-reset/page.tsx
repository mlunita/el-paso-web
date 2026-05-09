import { requireAdminSession } from "@/lib/auth";
import ShiftResetClient from "@/app/hq/shift-reset/shift-reset-client";

export default async function ShiftResetPage() {
  await requireAdminSession();

  return <ShiftResetClient />;
}
