"use server";

import { verifyModToken, createModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function authenticateModerator(plainToken: string) {
  try {
    const result = await verifyModToken(plainToken);

    // Get request headers for logging
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    if (!result.valid || !result.token) {
      // Log failed attempt — we can't tie it to a token, so log for all active tokens won't work
      // Just return the error
      return { success: false, error: result.reason || "Invalid token" };
    }

    // Log successful login
    await prisma.moderatorLoginLog.create({
      data: {
        tokenId: result.token.id,
        ipAddress,
        userAgent: userAgent.substring(0, 500), // truncate
        success: true,
        reason: "Authentication successful",
      },
    });

    // Create session
    await createModSession(result.token.id);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: "Authentication failed" };
  }
}
