import { requireAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaderboardData } from "@/app/hq/moderation-actions";
import LeaderboardClient from "./client-page";

export default async function LeaderboardPage(
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

  const leaderboard = await getLeaderboardData({ from, to });

  return (
    <LeaderboardClient 
      leaderboard={JSON.parse(JSON.stringify(leaderboard))} 
      initialDateRange={{ from, to }}
    />
  );
}
