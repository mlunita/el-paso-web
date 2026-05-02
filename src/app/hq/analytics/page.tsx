import { requireAdminSession } from "@/lib/auth";
import AnalyticsDashboard from "./analytics-dashboard";

export default async function AnalyticsPage() {
  await requireAdminSession();

  return <AnalyticsDashboard />;
}
