import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const daysParam = request.nextUrl.searchParams.get("days");
  const days = Math.min(Math.max(parseInt(daysParam || "30", 10) || 30, 1), 365);
  const data = await getAnalyticsSummary(days);

  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
