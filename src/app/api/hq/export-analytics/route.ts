import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getStaffAnalytics } from "@/app/hq/moderation-actions";
import ExcelJS from "exceljs";

export async function GET(request: Request) {
  try {
    // 1. Verify admin session
    await requireAdminSession();

    // 2. Parse date filters
    const url = new URL(request.url);
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;

    // 3. Fetch the exact same data using the shared backend function
    const analytics = await getStaffAnalytics({ from, to });

    // 4. Initialize Excel Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "El Paso RP Moderation";
    workbook.created = new Date();

    // --- SHEET 1: Summary ---
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 },
    ];
    
    // Header styling
    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF333333" } };

    summarySheet.addRows([
      { metric: "Date Filter applied", value: (from || "Beginning") + " to " + (to || "Now") },
      { metric: "Total Shifts", value: analytics.overview.totalShifts },
      { metric: "Completed Shifts", value: analytics.overview.completedShifts },
      { metric: "Total Moderation Actions", value: analytics.overview.totalActions },
      { metric: "Unreviewed Actions", value: analytics.overview.unreviewedActions },
      { metric: "Total Roblox Lookups", value: analytics.overview.totalLookups },
      { metric: "Total Ban Requests", value: analytics.overview.totalBanRequests },
      { metric: "Shift Trend (%)", value: analytics.predictions.shiftTrend },
      { metric: "Action Trend (%)", value: analytics.predictions.actionTrend },
    ]);

    // --- SHEET 2: Leaderboard ---
    const leaderSheet = workbook.addWorksheet("Leaderboard", { views: [{ state: "frozen", ySplit: 1 }] });
    leaderSheet.columns = [
      { header: "Staff Name", key: "modName", width: 25 },
      { header: "Role", key: "modRole", width: 20 },
      { header: "Total Shifts", key: "shifts", width: 15 },
      { header: "Total Actions", key: "actions", width: 15 },
      { header: "Total Hours", key: "hours", width: 15 },
      { header: "Break Hours", key: "break", width: 15 },
    ];

    leaderSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    leaderSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF10B981" } }; // Emerald green

    const sortedMods = [...analytics.moderators].sort((a, b) => b.actionCount - a.actionCount);
    for (const mod of sortedMods) {
      leaderSheet.addRow({
        modName: mod.modName,
        modRole: mod.modRole,
        shifts: mod.shiftCount,
        actions: mod.actionCount,
        hours: (mod.totalSeconds / 3600).toFixed(2),
        break: (mod.breakSeconds / 3600).toFixed(2),
      });
    }

    // --- SHEET 3: Alerts & Anomalies ---
    const alertsSheet = workbook.addWorksheet("Alerts");
    alertsSheet.columns = [
      { header: "Type", key: "type", width: 20 },
      { header: "Details", key: "details", width: 80 },
    ];

    alertsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    alertsSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEF4444" } }; // Red

    for (const anomaly of analytics.anomalies) {
      alertsSheet.addRow({ type: "Anomaly", details: anomaly });
    }
    for (const inactive of analytics.inactiveMods) {
      alertsSheet.addRow({ type: "Inactive", details: `${inactive.modName} has no shifts in the last 14 days.` });
    }
    if (analytics.anomalies.length === 0 && analytics.inactiveMods.length === 0) {
      alertsSheet.addRow({ type: "All Clear", details: "No anomalies or inactive moderators detected." });
    }

    // 5. Generate and return Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Staff_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });

  } catch (error) {
    console.error("Error generating Excel export:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
