import { requireAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStaffAnalytics } from "@/app/hq/moderation-actions";
import StaffAnalyticsClient from "./analytics-client";

export default async function StaffAnalyticsPage() {
  try {
    await requireAdminSession();
  } catch {
    redirect("/hq-login");
  }

  const analytics = await getStaffAnalytics();

  return <StaffAnalyticsClient analytics={JSON.parse(JSON.stringify(analytics))} />;
}
