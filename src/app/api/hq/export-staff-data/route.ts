import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getStaffDataExport } from "@/app/hq/moderation-actions";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    await requireAdminSession();

    const data = await getStaffDataExport();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "El Paso RP Moderation";
    workbook.created = new Date();

    // --- SHEET 1: Mod Actions ---
    const actionsSheet = workbook.addWorksheet("Mod Actions", { views: [{ state: "frozen", ySplit: 1 }] });
    actionsSheet.columns = [
      { header: "ID", key: "id", width: 28 },
      { header: "Moderator", key: "modName", width: 25 },
      { header: "Mod ID", key: "modId", width: 20 },
      { header: "Role", key: "modRole", width: 20 },
      { header: "Action Type", key: "actionType", width: 20 },
      { header: "Target User", key: "targetUser", width: 20 },
      { header: "Reason", key: "reason", width: 40 },
      { header: "Evidence Link", key: "evidenceLink", width: 40 },
      { header: "Review Status", key: "reviewStatus", width: 15 },
      { header: "Created At", key: "createdAt", width: 22 },
    ];
    actionsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    actionsSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8A44A" } };

    for (const a of data.actions) {
      actionsSheet.addRow({
        ...a,
        createdAt: new Date(a.createdAt).toISOString(),
      });
    }

    // --- SHEET 2: Shifts ---
    const shiftsSheet = workbook.addWorksheet("Shifts", { views: [{ state: "frozen", ySplit: 1 }] });
    shiftsSheet.columns = [
      { header: "ID", key: "id", width: 28 },
      { header: "Moderator", key: "modName", width: 25 },
      { header: "Mod ID", key: "modId", width: 20 },
      { header: "Role", key: "modRole", width: 20 },
      { header: "Shift Type", key: "shiftType", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Clock In", key: "clockIn", width: 22 },
      { header: "Clock Out", key: "clockOut", width: 22 },
      { header: "Total Hours", key: "totalHours", width: 12 },
      { header: "Break Hours", key: "breakHours", width: 12 },
      { header: "Notes", key: "notes", width: 40 },
    ];
    shiftsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    shiftsSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4ECDC4" } };

    for (const s of data.shifts) {
      shiftsSheet.addRow({
        ...s,
        clockIn: new Date(s.clockIn).toISOString(),
        clockOut: s.clockOut ? new Date(s.clockOut).toISOString() : "N/A",
        totalHours: (s.totalSeconds / 3600).toFixed(2),
        breakHours: (s.breakSeconds / 3600).toFixed(2),
      });
    }

    // --- SHEET 3: Ban Requests ---
    const bansSheet = workbook.addWorksheet("Ban Requests", { views: [{ state: "frozen", ySplit: 1 }] });
    bansSheet.columns = [
      { header: "ID", key: "id", width: 28 },
      { header: "Moderator", key: "modName", width: 25 },
      { header: "Mod ID", key: "modId", width: 20 },
      { header: "Role", key: "modRole", width: 20 },
      { header: "Target User ID", key: "targetUserId", width: 20 },
      { header: "Target Username", key: "targetUsername", width: 20 },
      { header: "Reason", key: "reason", width: 40 },
      { header: "Status", key: "status", width: 15 },
      { header: "Created At", key: "createdAt", width: 22 },
    ];
    bansSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    bansSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEF4444" } };

    for (const b of data.banRequests) {
      bansSheet.addRow({
        ...b,
        createdAt: new Date(b.createdAt).toISOString(),
      });
    }

    // --- SHEET 4: Roblox Lookups ---
    const lookupsSheet = workbook.addWorksheet("Lookups", { views: [{ state: "frozen", ySplit: 1 }] });
    lookupsSheet.columns = [
      { header: "ID", key: "id", width: 28 },
      { header: "Performed By", key: "performedBy", width: 20 },
      { header: "Performer Name", key: "performerName", width: 25 },
      { header: "Query", key: "query", width: 25 },
      { header: "Result User ID", key: "resultUserId", width: 20 },
      { header: "Result Name", key: "resultName", width: 20 },
      { header: "Success", key: "success", width: 10 },
      { header: "Created At", key: "createdAt", width: 22 },
    ];
    lookupsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    lookupsSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF8B5CF6" } };

    for (const l of data.lookups) {
      lookupsSheet.addRow({
        ...l,
        success: l.success ? "Yes" : "No",
        createdAt: new Date(l.createdAt).toISOString(),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Staff_Data_Export_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generating Staff Data export:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
