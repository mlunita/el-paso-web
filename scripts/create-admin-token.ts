/**
 * CLI script to create an admin token.
 *
 * Usage:
 *   pnpm admin:token:create -- --name "Main Admin"
 *   pnpm admin:token:create -- --name "Backup" --notes "Emergency access" --expires 2025-12-31
 *
 * Requires ROOT_ADMIN_SECRET to be set in .env (min 16 chars).
 * The raw token is printed ONCE to the terminal — copy it immediately.
 */

import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// ========== Argument Parsing ==========

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--") && i + 1 < argv.length) {
      const key = arg.slice(2);
      args[key] = argv[++i];
    }
  }
  return args;
}

// ========== Main ==========

async function main() {
  // 1. Verify ROOT_ADMIN_SECRET
  const rootSecret = process.env.ROOT_ADMIN_SECRET;
  if (!rootSecret || rootSecret.length < 16) {
    console.error("❌ ROOT_ADMIN_SECRET must be set in .env (minimum 16 characters)");
    console.error("   Example: ROOT_ADMIN_SECRET=$(openssl rand -hex 32)");
    process.exit(1);
  }

  // 2. Parse arguments
  const args = parseArgs(process.argv.slice(2));
  const name = args.name;
  if (!name) {
    console.error("❌ --name is required");
    console.error("   Usage: pnpm admin:token:create -- --name \"Main Admin\"");
    process.exit(1);
  }

  const notes = args.notes || null;
  const expiresRaw = args.expires || null;
  let expiresAt: Date | null = null;

  if (expiresRaw) {
    expiresAt = new Date(expiresRaw);
    if (isNaN(expiresAt.getTime())) {
      console.error("❌ Invalid --expires date. Use ISO format like 2025-12-31");
      process.exit(1);
    }
  }

  // 3. Connect to database
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL not set in .env");
    process.exit(1);
  }

  const pool = new Pool({ connectionString, max: 1 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 4. Generate token: admin_<publicId>.<secret>
    const publicId = crypto.randomBytes(12).toString("hex"); // 24 hex chars
    const secret = crypto.randomBytes(48).toString("hex"); // 96 hex chars
    const rawToken = `admin_${publicId}.${secret}`;

    // 5. Hash the secret portion only
    const tokenHash = await bcrypt.hash(secret, 12);

    // 6. Insert into DB
    const record = await prisma.adminToken.create({
      data: {
        publicId,
        name,
        tokenHash,
        notes,
        expiresAt,
        createdBy: "cli:root",
      },
    });

    // 7. Print output
    console.log("\n" + "═".repeat(60));
    console.log("✅ Admin token created successfully");
    console.log("═".repeat(60));
    console.log("");
    console.log(`  ID:        ${record.id}`);
    console.log(`  Name:      ${record.name}`);
    console.log(`  Status:    ACTIVE`);
    console.log(`  Created:   ${record.createdAt.toISOString()}`);
    if (expiresAt) {
      console.log(`  Expires:   ${expiresAt.toISOString()}`);
    }
    if (notes) {
      console.log(`  Notes:     ${notes}`);
    }
    console.log("");
    console.log("  ⚠️  Copy the token below — it will NEVER be shown again:");
    console.log("");
    console.log(`  ${rawToken}`);
    console.log("");
    console.log("═".repeat(60));
    console.log("");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
