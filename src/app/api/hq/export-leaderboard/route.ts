import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getLeaderboardData } from "@/app/hq/moderation-actions";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  try {
    // 1. Verify admin session
    await requireAdminSession();

    // 2. Parse date filters
    const url = new URL(request.url);
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;

    // 3. Fetch leaderboard data
    const leaderboard = await getLeaderboardData({ from, to });

    // 4. Initialize Excel Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "El Paso RP Moderation";
    workbook.created = new Date();

    // --- SHEET: Leaderboard ---
    const leaderSheet = workbook.addWorksheet("Leaderboard", { views: [{ state: "frozen", ySplit: 1 }] });
    leaderSheet.columns = [
      { header: "Rank", key: "rank", width: 10 },
      { header: "Moderator Name", key: "modName", width: 30 },
      { header: "Role", key: "modRole", width: 25 },
      { header: "Action Breakdown", key: "breakdown", width: 50 },
      { header: "Total Actions", key: "actionCount", width: 15 },
      { header: "Total Points", key: "points", width: 15 },
    ];

    // Header styling
    leaderSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    leaderSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAB308" } }; // Yellow/Gold for leaderboard

    // Populate data
    leaderboard.forEach((mod, index) => {
      const breakdownStr = Object.entries(mod.breakdown)
        .map(([type, count]) => `${type.replace(/_/g, ' ')}: ${count}`)
        .join(", ");

      leaderSheet.addRow({
        rank: index + 1,
        modName: mod.modName,
        modRole: mod.modRole,
        breakdown: breakdownStr,
        actionCount: mod.actionCount,
        points: mod.points,
      });
    });

    // 5. Generate and return Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Staff_Leaderboard_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });

  } catch (error) {
    console.error("Error generating Leaderboard Excel export:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
