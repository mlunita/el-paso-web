"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ========== Constants ==========

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_S = 60 * 60 * 12; // 12 hours

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be set (min 16 chars)");
  }
  return secret;
}

// ========== Rate Limiter ==========

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

// Periodic cleanup to prevent memory leaks (runs lazily)
let lastCleanup = Date.now();
function cleanupRateLimiter() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return; // max once per minute
  lastCleanup = now;
  for (const [key, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(key);
  }
}

// ========== HMAC Session Signing ==========

function signSession(payload: Record<string, unknown>): string {
  const secret = getSessionSecret();
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString("base64url");
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${hmac}`;
}

function verifySessionSignature(
  token: string
): Record<string, unknown> | null {
  const secret = getSessionSecret();
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, hmac] = parts;
  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");

  // Constant-time comparison
  if (
    hmac.length !== expectedHmac.length ||
    !crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))
  ) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString());
  } catch {
    return null;
  }
}

// ========== Token Verification ==========

/**
 * Verify an admin token in the format `admin_<publicId>.<secret>`.
 * Looks up a single row by publicId, then bcrypt-compares the secret.
 */
export async function verifyAdminToken(rawToken: string) {
  cleanupRateLimiter();

  // Parse token format: admin_<publicId>.<secret>
  if (!rawToken.startsWith("admin_")) {
    return { valid: false as const };
  }

  const withoutPrefix = rawToken.slice("admin_".length);
  const dotIndex = withoutPrefix.indexOf(".");
  if (dotIndex === -1) {
    return { valid: false as const };
  }

  const publicId = withoutPrefix.slice(0, dotIndex);
  const secret = withoutPrefix.slice(dotIndex + 1);

  if (!publicId || !secret) {
    return { valid: false as const };
  }

  // O(1) lookup by publicId
  const token = await prisma.adminToken.findUnique({
    where: { publicId },
  });

  if (!token) {
    return { valid: false as const };
  }

  // Check revocation
  if (token.revokedAt) {
    return { valid: false as const };
  }

  // Check expiry
  if (token.expiresAt && new Date() > token.expiresAt) {
    return { valid: false as const };
  }

  // Compare secret against stored hash
  const match = await bcrypt.compare(secret, token.tokenHash);
  if (!match) {
    return { valid: false as const };
  }

  return { valid: true as const, token };
}

// ========== Session Management ==========

export async function createAdminSession(tokenId: string) {
  const token = await prisma.adminToken.findUnique({
    where: { id: tokenId },
  });

  if (!token || token.revokedAt) {
    throw new Error("Token is not active");
  }

  const payload = {
    tokenId: token.id,
    publicId: token.publicId,
    name: token.name,
    iat: Date.now(),
  };

  const sessionToken = signSession(payload);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });

  return payload;
}

/**
 * Full server-side session validation:
 * 1. Cookie present?
 * 2. HMAC signature valid?
 * 3. Session not expired (12h)?
 * 4. DB token still active (not revoked, not expired)?
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie?.value) return null;

  // Verify HMAC signature
  const payload = verifySessionSignature(sessionCookie.value);
  if (!payload) return null;

  // Verify session age
  const iat = payload.iat as number;
  if (!iat || Date.now() - iat > SESSION_MAX_AGE_S * 1000) {
    return null;
  }

  const tokenId = payload.tokenId as string;
  if (!tokenId) return null;

  // Verify DB token status — revocation takes effect immediately
  const token = await prisma.adminToken.findUnique({
    where: { id: tokenId },
  });

  if (!token) return null;
  if (token.revokedAt) return null;
  if (token.expiresAt && new Date() > token.expiresAt) return null;

  return payload as {
    tokenId: string;
    publicId: string;
    name: string;
    iat: number;
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
