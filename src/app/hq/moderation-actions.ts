"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  adminEditShiftSchema,
  adminReviewActionSchema,
  robloxLookupSchema,
} from "@/lib/validation";
import { lookupRobloxUser, getInternalUserData, checkLookupRateLimit } from "@/lib/roblox";
import { z } from "zod";

// =====================================================
// Admin Shift Management
// =====================================================

/** Get all shifts with optional filters */
export async function getAllShifts(filters: {
  modId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  await requireAdminSession();

  const { modId, status, dateFrom, dateTo, page = 1, pageSize = 30 } = filters;

  const where: Record<string, unknown> = {};
  if (modId) where.modId = modId;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.clockIn = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  const [shifts, total] = await Promise.all([
    prisma.modShift.findMany({
      where,
      orderBy: { clockIn: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { breaks: true },
    }),
    prisma.modShift.count({ where }),
  ]);

  return { shifts, total };
}

/** Get active staff (currently clocked in) */
export async function getActiveStaff() {
  await requireAdminSession();

  return prisma.modShift.findMany({
    where: { status: { in: ["ACTIVE", "PAUSED"] } },
    include: { breaks: true },
    orderBy: { clockIn: "asc" },
  });
}

/** Admin edit a shift */
export async function adminEditShift(prevState: unknown, formData: FormData) {
  try {
    await requireAdminSession();

    const validated = adminEditShiftSchema.parse({
      shiftId: formData.get("shiftId"),
      clockIn: formData.get("clockIn"),
      clockOut: formData.get("clockOut") || undefined,
      shiftType: formData.get("shiftType"),
      status: formData.get("status"),
      notes: formData.get("notes") || undefined,
      adminNotes: formData.get("adminNotes") || undefined,
    });

    const shift = await prisma.modShift.findUnique({
      where: { id: validated.shiftId },
    });

    if (!shift) {
      return { success: false, error: "Shift not found" };
    }

    const clockIn = new Date(validated.clockIn);
    const clockOut = validated.clockOut ? new Date(validated.clockOut) : null;

    if (clockOut && clockOut <= clockIn) {
      return { success: false, error: "Clock out must be after clock in" };
    }

    const totalSeconds = clockOut
      ? Math.floor((clockOut.getTime() - clockIn.getTime()) / 1000)
      : shift.totalSeconds;

    await prisma.modShift.update({
      where: { id: validated.shiftId },
      data: {
        clockIn,
        clockOut,
        shiftType: validated.shiftType,
        status: validated.status,
        totalSeconds,
        notes: validated.notes || shift.notes,
        adminNotes: validated.adminNotes || shift.adminNotes,
        editedBy: "admin",
        editedAt: new Date(),
      },
    });

    revalidatePath("/hq/shifts");
    revalidatePath("/mod/shifts");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to edit shift" };
  }
}

/** Force clock out a moderator */
export async function adminForceClockOut(shiftId: string) {
  await requireAdminSession();

  const shift = await prisma.modShift.findUnique({
    where: { id: shiftId },
    include: { breaks: true },
  });

  if (!shift || !["ACTIVE", "PAUSED"].includes(shift.status)) {
    throw new Error("No active shift found");
  }

  const now = new Date();
  const totalSeconds = Math.floor((now.getTime() - shift.clockIn.getTime()) / 1000);
  const breakSeconds = shift.breaks.reduce((acc, b) => {
    if (b.endedAt) return acc + b.duration;
    return acc + Math.floor((now.getTime() - b.startedAt.getTime()) / 1000);
  }, 0);

  // Close any open breaks
  const openBreak = shift.breaks.find((b) => !b.endedAt);
  if (openBreak) {
    await prisma.modShiftBreak.update({
      where: { id: openBreak.id },
      data: {
        endedAt: now,
        duration: Math.floor((now.getTime() - openBreak.startedAt.getTime()) / 1000),
      },
    });
  }

  await prisma.modShift.update({
    where: { id: shiftId },
    data: {
      status: "COMPLETED",
      clockOut: now,
      totalSeconds,
      breakSeconds,
      adminNotes: `${shift.adminNotes || ""}\n[Force clocked out by admin at ${now.toISOString()}]`.trim(),
      editedBy: "admin",
      editedAt: now,
    },
  });

  revalidatePath("/hq/shifts");
  revalidatePath("/mod/shifts");
}

/** Cancel a shift (admin) */
export async function adminCancelShift(shiftId: string) {
  await requireAdminSession();

  await prisma.modShift.update({
    where: { id: shiftId },
    data: {
      status: "CANCELLED",
      adminNotes: `Cancelled by admin at ${new Date().toISOString()}`,
      editedBy: "admin",
      editedAt: new Date(),
    },
  });

  revalidatePath("/hq/shifts");
  revalidatePath("/mod/shifts");
}

// =====================================================
// Admin Mod Action Management
// =====================================================

/** Get all mod actions with filters */
export async function getAllModActions(filters: {
  modId?: string;
  actionType?: string;
  reviewStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  await requireAdminSession();

  const { modId, actionType, reviewStatus, dateFrom, dateTo, page = 1, pageSize = 30 } = filters;

  const where: Record<string, unknown> = { deletedAt: null };
  if (modId) where.modId = modId;
  if (actionType) where.actionType = actionType;
  if (reviewStatus) where.reviewStatus = reviewStatus;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  const [actions, total] = await Promise.all([
    prisma.modAction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { auditLogs: true } },
      },
    }),
    prisma.modAction.count({ where }),
  ]);

  return { actions, total };
}

/** Admin review a mod action */
export async function adminReviewModAction(prevState: unknown, formData: FormData) {
  try {
    await requireAdminSession();

    const validated = adminReviewActionSchema.parse({
      actionId: formData.get("actionId"),
      reviewStatus: formData.get("reviewStatus"),
      reviewNotes: formData.get("reviewNotes") || undefined,
    });

    const action = await prisma.modAction.findUnique({
      where: { id: validated.actionId },
    });

    if (!action) {
      return { success: false, error: "Action not found" };
    }

    await prisma.modAction.update({
      where: { id: validated.actionId },
      data: {
        reviewStatus: validated.reviewStatus,
        reviewedBy: "admin",
        reviewedAt: new Date(),
        reviewNotes: validated.reviewNotes || action.reviewNotes,
      },
    });

    await prisma.modActionAuditLog.create({
      data: {
        actionId: validated.actionId,
        event: "REVIEW_CHANGED",
        performedBy: "admin",
        fromValue: action.reviewStatus,
        toValue: validated.reviewStatus,
        details: validated.reviewNotes || null,
      },
    });

    revalidatePath("/hq/mod-actions");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to review action" };
  }
}

/** Bulk review mod actions */
export async function adminBulkUpdateModActions(actionIds: string[], status: string) {
  try {
    await requireAdminSession();
    
    if (!actionIds || actionIds.length === 0) {
      return { success: false, error: "No actions selected" };
    }

    const validStatuses = ["UNREVIEWED", "REVIEWED", "FLAGGED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    // 1. Fetch only actions that actually need updating (outside transaction)
    const actionsToUpdate = await prisma.modAction.findMany({
      where: { 
        id: { in: actionIds },
        reviewStatus: { not: status }
      }
    });

    if (actionsToUpdate.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const idsToUpdate = actionsToUpdate.map((a) => a.id);
    const now = new Date();

    // 2. Short transaction only for the critical bulk update
    await prisma.$transaction(async (tx) => {
      await tx.modAction.updateMany({
        where: { id: { in: idsToUpdate } },
        data: {
          reviewStatus: status,
          reviewedBy: "admin",
          reviewedAt: now,
          reviewNotes: `Bulk updated to ${status} by admin`,
        },
      });
    });

    // 3. Prepare audit logs outside the transaction
    const auditLogsData = actionsToUpdate.map((action) => ({
      actionId: action.id,
      event: "REVIEW_CHANGED",
      performedBy: "admin",
      fromValue: action.reviewStatus,
      toValue: status,
      details: "Bulk updated",
    }));

    // 4. Batch insert logs if dataset is large to avoid blocking the event loop
    const BATCH_SIZE = 500;
    for (let i = 0; i < auditLogsData.length; i += BATCH_SIZE) {
      const batch = auditLogsData.slice(i, i + BATCH_SIZE);
      await prisma.modActionAuditLog.createMany({
        data: batch,
      });
      // Yield to event loop to avoid blocking for huge datasets
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    revalidatePath("/hq/mod-actions");
    return { success: true, updatedCount: idsToUpdate.length };
  } catch (err) {
    console.error("Bulk update error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to bulk update actions" };
  }
}

/** Soft delete a mod action */
export async function adminDeleteModAction(actionId: string) {
  await requireAdminSession();

  await prisma.modAction.update({
    where: { id: actionId },
    data: {
      deletedAt: new Date(),
      deletedBy: "admin",
    },
  });

  await prisma.modActionAuditLog.create({
    data: {
      actionId,
      event: "DELETED",
      performedBy: "admin",
      details: "Deleted by admin",
    },
  });

  revalidatePath("/hq/mod-actions");
}

// =====================================================
// Admin Roblox Lookup
// =====================================================

export async function adminRobloxLookup(prevState: unknown, formData: FormData) {
  try {
    await requireAdminSession();

    const validated = robloxLookupSchema.parse({
      query: formData.get("query"),
    });

    if (!checkLookupRateLimit("admin")) {
      return { success: false, error: "Rate limit exceeded. Wait a moment." };
    }

    const robloxUser = await lookupRobloxUser(validated.query);

    await prisma.robloxLookupLog.create({
      data: {
        performedBy: "admin",
        performerName: "Admin",
        query: validated.query,
        resultUserId: robloxUser?.userId || null,
        resultName: robloxUser?.username || null,
        success: !!robloxUser,
      },
    });

    if (!robloxUser) {
      return { success: false, error: "User not found on Roblox." };
    }

    const internalData = await getInternalUserData(robloxUser.userId);

    return {
      success: true,
      user: {
        ...robloxUser,
        accountCreated: robloxUser.accountCreated?.toISOString() || null,
      },
      internal: {
        applications: internalData.applications.map((a) => ({
          id: a.id,
          refCode: a.refCode,
          discord: a.discord,
          roblox: a.roblox,
          status: a.status,
          createdAt: a.createdAt.toISOString(),
        })),
        banRequests: internalData.banRequests.map((b) => ({
          id: b.id,
          status: b.status,
          reason: b.reason,
          modName: b.modName,
          modRole: b.modRole,
          createdAt: b.createdAt.toISOString(),
          evidenceCount: b._count.evidence,
        })),
        modActions: internalData.modActions.map((a) => ({
          id: a.id,
          actionType: a.actionType,
          reason: a.reason,
          modName: a.modName,
          modRole: a.modRole,
          reviewStatus: a.reviewStatus,
          createdAt: a.createdAt.toISOString(),
        })),
        lookupCount: internalData.lookupLogs.length,
      },
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Lookup failed" };
  }
}

// =====================================================
// Analytics & Leaderboard Data
// =====================================================

/** Get comprehensive staff analytics */
export async function getStaffAnalytics(dateRange?: { from?: string; to?: string }) {
  await requireAdminSession();

  const dateFilter: Record<string, unknown> = {};
  if (dateRange?.from || dateRange?.to) {
    dateFilter.createdAt = {
      ...(dateRange.from ? { gte: new Date(dateRange.from) } : {}),
      ...(dateRange.to ? { lte: new Date(dateRange.to) } : {}),
    };
  }

  const shiftDateFilter: Record<string, unknown> = {};
  if (dateRange?.from || dateRange?.to) {
    shiftDateFilter.clockIn = {
      ...(dateRange.from ? { gte: new Date(dateRange.from) } : {}),
      ...(dateRange.to ? { lte: new Date(dateRange.to) } : {}),
    };
  }

  // Global aggregations
  const [
    totalShifts,
    completedShifts,
    activeShifts,
    totalActions,
    unreviewedActions,
    totalLookups,
    totalBanRequests,
  ] = await Promise.all([
    prisma.modShift.count({ where: shiftDateFilter }),
    prisma.modShift.count({ where: { ...shiftDateFilter, status: "COMPLETED" } }),
    prisma.modShift.count({ where: { status: { in: ["ACTIVE", "PAUSED"] } } }),
    prisma.modAction.count({ where: { ...dateFilter, deletedAt: null } }),
    prisma.modAction.count({ where: { ...dateFilter, deletedAt: null, reviewStatus: "UNREVIEWED" } }),
    prisma.robloxLookupLog.count({ where: dateFilter }),
    prisma.banRequest.count({ where: dateFilter }),
  ]);

  // Per-moderator data
  const modShiftAgg = await prisma.modShift.groupBy({
    by: ["modId", "modName", "modRole"],
    where: { ...shiftDateFilter, status: "COMPLETED" },
    _count: { id: true },
    _sum: { totalSeconds: true, breakSeconds: true },
  });

  const modActionAgg = await prisma.modAction.groupBy({
    by: ["modId", "modName", "modRole"],
    where: { ...dateFilter, deletedAt: null },
    _count: { id: true },
  });

  // Build per-mod leaderboard
  const modMap = new Map<string, {
    modId: string;
    modName: string;
    modRole: string;
    shiftCount: number;
    totalSeconds: number;
    breakSeconds: number;
    actionCount: number;
  }>();

  for (const row of modShiftAgg) {
    modMap.set(row.modId, {
      modId: row.modId,
      modName: row.modName,
      modRole: row.modRole,
      shiftCount: row._count.id,
      totalSeconds: row._sum.totalSeconds || 0,
      breakSeconds: row._sum.breakSeconds || 0,
      actionCount: 0,
    });
  }

  for (const row of modActionAgg) {
    const existing = modMap.get(row.modId);
    if (existing) {
      existing.actionCount = row._count.id;
    } else {
      modMap.set(row.modId, {
        modId: row.modId,
        modName: row.modName,
        modRole: row.modRole,
        shiftCount: 0,
        totalSeconds: 0,
        breakSeconds: 0,
        actionCount: row._count.id,
      });
    }
  }

  const moderators = Array.from(modMap.values());

  // Action type breakdown
  const actionTypeBreakdown = await prisma.modAction.groupBy({
    by: ["actionType"],
    where: { ...dateFilter, deletedAt: null },
    _count: { id: true },
  });

  // Shift type breakdown
  const shiftTypeBreakdown = await prisma.modShift.groupBy({
    by: ["shiftType"],
    where: { ...shiftDateFilter, status: "COMPLETED" },
    _count: { id: true },
    _sum: { totalSeconds: true },
  });

  // Recent activity (last 7 days daily counts)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentShifts = await prisma.modShift.findMany({
    where: { clockIn: { gte: sevenDaysAgo }, status: "COMPLETED" },
    select: { clockIn: true, totalSeconds: true },
  });

  const recentActions = await prisma.modAction.findMany({
    where: { createdAt: { gte: sevenDaysAgo }, deletedAt: null },
    select: { createdAt: true },
  });

  // Group by day
  const dailyData: { date: string; shifts: number; actions: number; hours: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayShifts = recentShifts.filter(
      (s) => s.clockIn.toISOString().slice(0, 10) === dateStr
    );
    const dayActions = recentActions.filter(
      (a) => a.createdAt.toISOString().slice(0, 10) === dateStr
    );

    dailyData.push({
      date: dateStr,
      shifts: dayShifts.length,
      actions: dayActions.length,
      hours: Math.round(dayShifts.reduce((acc, s) => acc + s.totalSeconds, 0) / 3600 * 10) / 10,
    });
  }

  // Anomaly detection: mods with >12h single shifts or >50 actions/day
  const anomalies: string[] = [];
  const longShifts = await prisma.modShift.findMany({
    where: {
      ...shiftDateFilter,
      status: "COMPLETED",
      totalSeconds: { gte: 12 * 3600 },
    },
    select: { modName: true, modId: true, totalSeconds: true, clockIn: true },
    take: 10,
  });

  for (const s of longShifts) {
    anomalies.push(
      `${s.modName} logged a ${Math.round(s.totalSeconds / 3600)}h shift on ${s.clockIn.toISOString().slice(0, 10)}`
    );
  }

  // Inactive detection: mods with no shifts in last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const activeTokens = await prisma.moderatorToken.findMany({
    where: { status: "ACTIVE" },
    select: { moderatorId: true, moderatorName: true },
  });

  const recentlyActiveModIds = await prisma.modShift.findMany({
    where: { clockIn: { gte: fourteenDaysAgo } },
    select: { modId: true },
    distinct: ["modId"],
  });

  const recentlyActiveSet = new Set(recentlyActiveModIds.map((r) => r.modId));
  const inactiveMods = activeTokens.filter((t) => !recentlyActiveSet.has(t.moderatorId));

  // Simple predictions based on trends
  const thisWeekShifts = recentShifts.length;
  const thisWeekActions = recentActions.length;

  // Last week comparison
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [lastWeekShiftCount, lastWeekActionCount] = await Promise.all([
    prisma.modShift.count({
      where: {
        clockIn: { gte: twoWeeksAgo, lt: sevenDaysAgo },
        status: "COMPLETED",
      },
    }),
    prisma.modAction.count({
      where: {
        createdAt: { gte: twoWeeksAgo, lt: sevenDaysAgo },
        deletedAt: null,
      },
    }),
  ]);

  const shiftTrend = lastWeekShiftCount > 0
    ? Math.round(((thisWeekShifts - lastWeekShiftCount) / lastWeekShiftCount) * 100)
    : 0;
  const actionTrend = lastWeekActionCount > 0
    ? Math.round(((thisWeekActions - lastWeekActionCount) / lastWeekActionCount) * 100)
    : 0;

  return {
    overview: {
      totalShifts,
      completedShifts,
      activeShifts,
      totalActions,
      unreviewedActions,
      totalLookups,
      totalBanRequests,
    },
    moderators,
    actionTypeBreakdown: actionTypeBreakdown.map((a) => ({
      type: a.actionType,
      count: a._count.id,
    })),
    shiftTypeBreakdown: shiftTypeBreakdown.map((s) => ({
      type: s.shiftType,
      count: s._count.id,
      totalHours: Math.round((s._sum.totalSeconds || 0) / 3600 * 10) / 10,
    })),
    dailyData,
    anomalies,
    inactiveMods: inactiveMods.map((m) => ({
      modId: m.moderatorId,
      modName: m.moderatorName,
    })),
    predictions: {
      shiftTrend,
      actionTrend,
      estimatedNextWeekShifts: Math.max(0, thisWeekShifts + Math.round(thisWeekShifts * shiftTrend / 100)),
      estimatedNextWeekActions: Math.max(0, thisWeekActions + Math.round(thisWeekActions * actionTrend / 100)),
    },
  };
}

// =====================================================
// Leaderboard Data
// =====================================================

export async function getLeaderboardData(dateRange?: { from?: string; to?: string }) {
  await requireAdminSession();

  const dateFilter: Record<string, unknown> = { deletedAt: null };
  if (dateRange?.from || dateRange?.to) {
    dateFilter.createdAt = {
      ...(dateRange.from ? { gte: new Date(dateRange.from) } : {}),
      ...(dateRange.to ? { lte: new Date(dateRange.to) } : {}),
    };
  }

  const allActions = await prisma.modAction.findMany({
    where: dateFilter,
    select: { modId: true, modName: true, modRole: true, actionType: true },
  });

  const modMap = new Map<string, {
    modId: string;
    modName: string;
    modRole: string;
    actionCount: number;
    points: number;
    breakdown: Record<string, number>;
  }>();

  for (const action of allActions) {
    if (!modMap.has(action.modId)) {
      modMap.set(action.modId, {
        modId: action.modId,
        modName: action.modName,
        modRole: action.modRole,
        actionCount: 0,
        points: 0,
        breakdown: {},
      });
    }
    const mod = modMap.get(action.modId)!;
    mod.actionCount++;
    mod.points++;
    mod.breakdown[action.actionType] = (mod.breakdown[action.actionType] || 0) + 1;
  }

  const leaderboard = Array.from(modMap.values()).sort((a, b) => b.points - a.points);
  return leaderboard;
}
