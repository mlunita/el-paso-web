import { z } from "zod";

// =====================================================
// Shift System Schemas
// =====================================================

export const SHIFT_TYPES = [
  "REGULAR",
  "TRAINING",
  "EVENT",
  "EMERGENCY",
  "OVERTIME",
] as const;

export const SHIFT_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
  "EDITED",
] as const;

export const clockInSchema = z.object({
  shiftType: z.enum(SHIFT_TYPES).default("REGULAR"),
  notes: z.string().trim().max(500, "Notes are too long").optional(),
});

export const clockOutSchema = z.object({
  notes: z.string().trim().max(500, "Notes are too long").optional(),
});

export const pauseShiftSchema = z.object({
  reason: z.string().trim().max(200, "Reason is too long").optional(),
});

export const adminEditShiftSchema = z.object({
  shiftId: z.string().min(1, "Shift ID required"),
  clockIn: z.string().min(1, "Clock in time required"),
  clockOut: z.string().optional(),
  shiftType: z.enum(SHIFT_TYPES),
  status: z.enum(SHIFT_STATUSES),
  notes: z.string().trim().max(500).optional(),
  adminNotes: z.string().trim().max(500).optional(),
});

// =====================================================
// Mod Action Schemas
// =====================================================

export const ACTION_TYPES = [
  "BAN_REQUEST",
  "MODLOG",
  "TICKET",
  "CHEATER_BAN",
  "WARNING",
  "KICK",
  "APPEAL_REVIEW",
  "STAFF_NOTE",
  "CASE_REVIEW",
  "INTERNAL_ESCALATION",
  "CUSTOM",
] as const;

export const ACTION_TYPE_LABELS: Record<string, string> = {
  BAN_REQUEST: "Ban Request",
  MODLOG: "Mod Log",
  TICKET: "Ticket",
  CHEATER_BAN: "Cheater Ban",
  WARNING: "Warning",
  KICK: "Kick",
  APPEAL_REVIEW: "Appeal Review",
  STAFF_NOTE: "Staff Note",
  CASE_REVIEW: "Case Review",
  INTERNAL_ESCALATION: "Internal Escalation",
  CUSTOM: "Custom",
};

export const REVIEW_STATUSES = [
  "UNREVIEWED",
  "REVIEWED",
  "FLAGGED",
  "REJECTED",
] as const;

const URL_REGEX = /^https?:\/\/.+/i;

export const createModActionSchema = z.object({
  actionType: z.enum(ACTION_TYPES),
  preset: z.string().trim().max(100).optional(),
  targetUser: z.string().trim().min(1, "Target user is required").max(100),
  reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(1000, "Reason is too long"),
  evidenceLink: z
    .string()
    .trim()
    .min(1, "Evidence link is required")
    .max(500, "Link is too long")
    .regex(URL_REGEX, "Must be a valid URL starting with http:// or https://"),
  internalNotes: z.string().trim().max(2000, "Notes are too long").optional(),
});

export const updateModActionSchema = z.object({
  actionId: z.string().min(1),
  actionType: z.enum(ACTION_TYPES),
  preset: z.string().trim().max(100).optional(),
  targetUser: z.string().trim().min(1).max(100),
  reason: z.string().trim().min(3).max(1000),
  evidenceLink: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(URL_REGEX, "Must be a valid URL"),
  internalNotes: z.string().trim().max(2000).optional(),
});

export const adminReviewActionSchema = z.object({
  actionId: z.string().min(1),
  reviewStatus: z.enum(REVIEW_STATUSES),
  reviewNotes: z.string().trim().max(1000).optional(),
});

// =====================================================
// Roblox Lookup Schemas
// =====================================================

export const robloxLookupSchema = z.object({
  query: z.string().trim().min(1, "Search query required").max(50, "Query too long"),
});

// =====================================================
// URL Utilities
// =====================================================

export function normalizeUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    let path = u.pathname;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return `${u.origin.toLowerCase()}${path}${u.search}${u.hash}`;
  } catch {
    return urlStr;
  }
}
