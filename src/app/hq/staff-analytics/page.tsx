import { requireAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStaffAnalytics } from "@/app/hq/moderation-actions";
import StaffAnalyticsClient from "./analytics-client";

export default async function StaffAnalyticsPage(
  props: { searchParams?: Promise<{ from?: string; to?: string }> }
) {
  try {
    await requireAdminSession();
  } catch {
    redirect("/hq-login");
  }

  const searchParams = await props.searchParams;
  const from = searchParams?.from;
  const to = searchParams?.to;

  const analytics = await getStaffAnalytics({ from, to });

  return (
    <StaffAnalyticsClient 
      analytics={JSON.parse(JSON.stringify(analytics))} 
      initialDateRange={{ from, to }}
    />
  );
}
