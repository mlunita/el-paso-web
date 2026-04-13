"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ========== Token Generation ==========

const MOD_SESSION_COOKIE = "mod_session";
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-change-me";

/** Simple HMAC-based session token (not JWT for simplicity — signed and verified server-side) */
function signSession(payload: Record<string, any>): string {
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString("base64url");
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${hmac}`;
}

function verifySession(token: string): Record<string, any> | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, hmac] = parts;
  const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  if (hmac !== expectedHmac) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString());
  } catch {
    return null;
  }
}

// ========== Token Verification ==========

export async function verifyModToken(plainToken: string) {
  // Find all active tokens and compare hashes
  const tokens = await prisma.moderatorToken.findMany({
    where: { status: "ACTIVE" },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });

  for (const t of tokens) {
    const match = await bcrypt.compare(plainToken, t.tokenHash);
    if (match) {
      // Check expiry
      if (t.expiresAt && new Date() > t.expiresAt) {
        await prisma.moderatorToken.update({
          where: { id: t.id },
          data: { status: "EXPIRED" },
        });
        return { valid: false, reason: "Token expired" };
      }
      return {
        valid: true,
        token: t,
        permissions: t.role.permissions.map((p: { key: string }) => p.key),
      };
    }
  }

  return { valid: false, reason: "Invalid token" };
}

// ========== Session Management ==========

export async function createModSession(tokenId: string) {
  const token = await prisma.moderatorToken.findUnique({
    where: { id: tokenId },
    include: { role: { include: { permissions: true } } },
  });

  if (!token || token.status !== "ACTIVE") {
    throw new Error("Token is not active");
  }

  const payload = {
    tokenId: token.id,
    modName: token.moderatorName,
    modId: token.moderatorId,
    roleName: token.role.name,
    roleId: token.roleId,
    permissions: token.role.permissions.map((p: { key: string }) => p.key),
    iat: Date.now(),
  };

  const sessionToken = signSession(payload);

  const cookieStore = await cookies();
  cookieStore.set(MOD_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return payload;
}

export async function getModSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(MOD_SESSION_COOKIE);

  if (!sessionCookie?.value) return null;

  const payload = verifySession(sessionCookie.value);
  if (!payload) return null;

  // Verify the token is still active in DB
  const token = await prisma.moderatorToken.findUnique({
    where: { id: payload.tokenId },
  });

  if (!token || token.status !== "ACTIVE") {
    // Token was revoked — return null (cannot delete cookies during SSR)
    return null;
  }

  // Check expiry
  if (token.expiresAt && new Date() > token.expiresAt) {
    try {
      await prisma.moderatorToken.update({
        where: { id: token.id },
        data: { status: "EXPIRED" },
      });
    } catch {
      // Ignore DB errors on read-only path
    }
    return null;
  }

  return payload as {
    tokenId: string;
    modName: string;
    modId: string;
    roleName: string;
    roleId: string;
    permissions: string[];
    iat: number;
  };
}

export async function requireModPermission(permKey: string) {
  const session = await getModSession();
  if (!session) {
    throw new Error("Unauthorized: No moderator session");
  }
  if (!session.permissions.includes(permKey)) {
    throw new Error(`Forbidden: Missing permission '${permKey}'`);
  }
  return session;
}

export async function destroyModSession() {
  const cookieStore = await cookies();
  cookieStore.delete(MOD_SESSION_COOKIE);
}

export async function hasModSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(MOD_SESSION_COOKIE);
  if (!sessionCookie?.value) return false;
  const payload = verifySession(sessionCookie.value);
  return payload !== null;
}
