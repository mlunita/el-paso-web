/**
 * CLI script to revoke an admin token.
 *
 * Usage:
 *   pnpm admin:token:revoke -- --name "Main Admin"
 *   pnpm admin:token:revoke -- --id "clxxxxxxxxx"
 *
 * Requires ROOT_ADMIN_SECRET to be set in .env (min 16 chars).
 */

import "dotenv/config";
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
    process.exit(1);
  }

  // 2. Parse arguments
  const args = parseArgs(process.argv.slice(2));
  const id = args.id || null;
  const name = args.name || null;

  if (!id && !name) {
    console.error("❌ Provide --id or --name to identify the token to revoke");
    console.error("   Usage: pnpm admin:token:revoke -- --name \"Main Admin\"");
    process.exit(1);
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
    // 4. Find token
    const token = id
      ? await prisma.adminToken.findUnique({ where: { id } })
      : await prisma.adminToken.findFirst({ where: { name: name! } });

    if (!token) {
      console.error(`❌ Token not found (${id ? `id: ${id}` : `name: ${name}`})`);
      process.exit(1);
    }

    if (token.revokedAt) {
      console.log(`⚠️  Token "${token.name}" is already revoked (at ${token.revokedAt.toISOString()})`);
      process.exit(0);
    }

    // 5. Revoke
    await prisma.adminToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });

    // 6. Audit log
    await prisma.adminAuditLog.create({
      data: {
        tokenId: token.id,
        action: "TOKEN_REVOKED",
      },
    });

    console.log("\n" + "═".repeat(60));
    console.log("✅ Token revoked successfully");
    console.log("═".repeat(60));
    console.log(`  ID:        ${token.id}`);
    console.log(`  Name:      ${token.name}`);
    console.log(`  Status:    REVOKED`);
    console.log(`  Revoked:   ${new Date().toISOString()}`);
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
