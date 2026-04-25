"use server";

import { verifyAdminToken, createAdminSession, checkRateLimit } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const GENERIC_ERROR = "Authentication failed";

export async function authenticateAdmin(plainToken: string) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Rate limit check
    if (!(await checkRateLimit(ipAddress))) {
      return { success: false, error: GENERIC_ERROR };
    }

    const result = await verifyAdminToken(plainToken);

    if (!result.valid || !result.token) {
      return { success: false, error: GENERIC_ERROR };
    }

    // Update lastUsedAt
    await prisma.adminToken.update({
      where: { id: result.token.id },
      data: { lastUsedAt: new Date() },
    });

    // Audit log: successful login
    await prisma.adminAuditLog.create({
      data: {
        tokenId: result.token.id,
        action: "LOGIN",
        ipAddress,
        userAgent: userAgent.substring(0, 500),
      },
    });

    // Create session
    await createAdminSession(result.token.id);

    return { success: true };
  } catch {
    return { success: false, error: GENERIC_ERROR };
  }
}
