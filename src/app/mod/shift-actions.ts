"use server";

import { prisma } from "@/lib/prisma";
import { requireModPermission, getModSession } from "@/lib/mod-auth";
import { revalidatePath } from "next/cache";
import {
  clockInSchema,
  clockOutSchema,
  pauseShiftSchema,
  createModActionSchema,
  robloxLookupSchema,
} from "@/lib/validation";
import { lookupRobloxUser, getInternalUserData, checkLookupRateLimit } from "@/lib/roblox";
import { z } from "zod";

// =====================================================
// Shift Actions (Mod side)
// =====================================================

/** Clock in — creates a new shift */
export async function clockIn(prevState: unknown, formData: FormData) {
  try {
    const session = await requireModPermission("manage_shifts");

    // Check for existing active/paused shift
    const existing = await prisma.modShift.findFirst({
      where: {
        tokenId: session.tokenId,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
    });

    if (existing) {
      return { success: false, error: "You already have an active shift. Clock out first." };
    }

    const validated = clockInSchema.parse({
      shiftType: formData.get("shiftType") || "REGULAR",
      notes: formData.get("notes") || undefined,
    });

    await prisma.modShift.create({
      data: {
        tokenId: session.tokenId,
        modName: session.modName,
        modId: session.modId,
        modRole: session.roleName,
        shiftType: validated.shiftType,
        notes: validated.notes || null,
        status: "ACTIVE",
        clockIn: new Date(),
      },
    });

    revalidatePath("/mod/shifts");
    revalidatePath("/mod");
    revalidatePath("/hq/shifts");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to clock in" };
  }
}

/** Clock out — completes the current shift */
export async function clockOut(prevState: unknown, formData: FormData) {
  try {
    const session = await requireModPermission("manage_shifts");

    const shift = await prisma.modShift.findFirst({
      where: {
        tokenId: session.tokenId,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
      include: { breaks: true },
    });

    if (!shift) {
      return { success: false, error: "No active shift found." };
    }

    const validated = clockOutSchema.parse({
      notes: formData.get("notes") || undefined,
    });

    const now = new Date();

    // Close any open break
    const openBreak = shift.breaks.find((b) => !b.endedAt);
    if (openBreak) {
      const breakDuration = Math.floor((now.getTime() - openBreak.startedAt.getTime()) / 1000);
      await prisma.modShiftBreak.update({
        where: { id: openBreak.id },
        data: { endedAt: now, duration: breakDuration },
      });
    }

    // Calculate total break seconds
    const breakSeconds = shift.breaks.reduce((acc, b) => {
      if (b.endedAt) return acc + b.duration;
      // open break that we just closed
      return acc + Math.floor((now.getTime() - b.startedAt.getTime()) / 1000);
    }, 0);

    const totalSeconds = Math.floor((now.getTime() - shift.clockIn.getTime()) / 1000);

    await prisma.modShift.update({
      where: { id: shift.id },
      data: {
        status: "COMPLETED",
        clockOut: now,
        totalSeconds,
        breakSeconds,
        notes: validated.notes ? `${shift.notes || ""}\n${validated.notes}`.trim() : shift.notes,
      },
    });

    revalidatePath("/mod/shifts");
    revalidatePath("/mod");
    revalidatePath("/hq/shifts");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to clock out" };
  }
}

/** Pause the current shift (start a break) */
export async function pauseShift(prevState: unknown, formData: FormData) {
  try {
    const session = await requireModPermission("manage_shifts");

    const shift = await prisma.modShift.findFirst({
      where: {
        tokenId: session.tokenId,
        status: "ACTIVE",
      },
    });

    if (!shift) {
      return { success: false, error: "No active shift to pause." };
    }

    const validated = pauseShiftSchema.parse({
      reason: formData.get("reason") || undefined,
    });

    await prisma.$transaction([
      prisma.modShift.update({
        where: { id: shift.id },
        data: { status: "PAUSED" },
      }),
      prisma.modShiftBreak.create({
        data: {
          shiftId: shift.id,
          reason: validated.reason || null,
        },
      }),
    ]);

    revalidatePath("/mod/shifts");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to pause shift" };
  }
}

/** Resume the current shift (end the break) */
export async function resumeShift() {
  try {
    const session = await requireModPermission("manage_shifts");

    const shift = await prisma.modShift.findFirst({
      where: {
        tokenId: session.tokenId,
        status: "PAUSED",
      },
      include: { breaks: true },
    });

    if (!shift) {
      return { success: false, error: "No paused shift to resume." };
    }

    const openBreak = shift.breaks.find((b) => !b.endedAt);
    const now = new Date();

    if (openBreak) {
      const duration = Math.floor((now.getTime() - openBreak.startedAt.getTime()) / 1000);
      await prisma.modShiftBreak.update({
        where: { id: openBreak.id },
        data: { endedAt: now, duration },
      });
    }

    await prisma.modShift.update({
      where: { id: shift.id },
      data: { status: "ACTIVE" },
    });

    revalidatePath("/mod/shifts");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to resume shift" };
  }
}

/** Get current active shift for the mod */
export async function getMyActiveShift() {
  const session = await getModSession();
  if (!session) return null;

  return prisma.modShift.findFirst({
    where: {
      tokenId: session.tokenId,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    include: { breaks: true },
  });
}

/** Get shift history for current mod */
export async function getMyShiftHistory(page = 1, pageSize = 20) {
  const session = await getModSession();
  if (!session) return { shifts: [], total: 0 };

  const [shifts, total] = await Promise.all([
    prisma.modShift.findMany({
      where: { tokenId: session.tokenId },
      orderBy: { clockIn: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { breaks: true },
    }),
    prisma.modShift.count({ where: { tokenId: session.tokenId } }),
  ]);

  return { shifts, total };
}

// =====================================================
// Mod Action Actions (Mod side)
// =====================================================

/** Register a moderation action */
export async function createModAction(prevState: unknown, formData: FormData) {
  try {
    const session = await requireModPermission("create_mod_actions");

    const validated = createModActionSchema.parse({
      actionType: formData.get("actionType"),
      preset: formData.get("preset") || undefined,
      targetUser: formData.get("targetUser"),
      reason: formData.get("reason"),
      evidenceLink: formData.get("evidenceLink"),
      internalNotes: formData.get("internalNotes") || undefined,
    });

    // Duplicate check: same mod + same targetUser + same evidenceLink within 5 min
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await prisma.modAction.findFirst({
      where: {
        tokenId: session.tokenId,
        targetUser: validated.targetUser,
        evidenceLink: validated.evidenceLink,
        createdAt: { gte: fiveMinAgo },
        deletedAt: null,
      },
    });

    if (duplicate) {
      return { success: false, error: "A similar action was already registered in the last 5 minutes." };
    }

    const modAction = await prisma.modAction.create({
      data: {
        tokenId: session.tokenId,
        modName: session.modName,
        modId: session.modId,
        modRole: session.roleName,
        actionType: validated.actionType,
        preset: validated.preset || validated.actionType,
        targetUser: validated.targetUser,
        reason: validated.reason,
        evidenceLink: validated.evidenceLink,
        internalNotes: validated.internalNotes || null,
      },
    });

    // Audit log
    await prisma.modActionAuditLog.create({
      data: {
        actionId: modAction.id,
        event: "CREATED",
        performedBy: `mod:${session.modId}`,
        details: `Action created by ${session.modName}`,
      },
    });

    revalidatePath("/mod/actions");
    revalidatePath("/mod");
    revalidatePath("/hq/mod-actions");
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "Validation error" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Failed to register action" };
  }
}

/** Get my registered actions */
export async function getMyModActions(page = 1, pageSize = 20) {
  const session = await getModSession();
  if (!session) return { actions: [], total: 0 };

  const [actions, total] = await Promise.all([
    prisma.modAction.findMany({
      where: { tokenId: session.tokenId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.modAction.count({
      where: { tokenId: session.tokenId, deletedAt: null },
    }),
  ]);

  return { actions, total };
}

// =====================================================
// Roblox Lookup (Mod side)
// =====================================================

export async function performRobloxLookup(prevState: unknown, formData: FormData) {
  try {
    const session = await requireModPermission("roblox_lookup");

    const validated = robloxLookupSchema.parse({
      query: formData.get("query"),
    });

    // Rate limit
    if (!checkLookupRateLimit(`mod:${session.modId}`)) {
      return { success: false, error: "Rate limit exceeded. Wait a moment." };
    }

    const robloxUser = await lookupRobloxUser(validated.query);

    // Log the lookup
    await prisma.robloxLookupLog.create({
      data: {
        performedBy: `mod:${session.modId}`,
        performerName: session.modName,
        query: validated.query,
        resultUserId: robloxUser?.userId || null,
        resultName: robloxUser?.username || null,
        success: !!robloxUser,
      },
    });

    if (!robloxUser) {
      return { success: false, error: "User not found on Roblox." };
    }

    // Get internal data
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
          status: a.status,
          createdAt: a.createdAt.toISOString(),
        })),
        banRequests: internalData.banRequests.map((b) => ({
          id: b.id,
          status: b.status,
          reason: b.reason,
          modName: b.modName,
          createdAt: b.createdAt.toISOString(),
          evidenceCount: b._count.evidence,
        })),
        modActions: internalData.modActions.map((a) => ({
          id: a.id,
          actionType: a.actionType,
          reason: a.reason,
          modName: a.modName,
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
