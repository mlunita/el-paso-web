import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Re-try pulling from Vercel Postgres URL or fallback to DATABASE_URL.
let rawConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";

let finalConnectionString = rawConnectionString;

// Auto-fix Supabase connection strings for Vercel serverless environments
// Serverless functions must use Transaction pooling (port 6543) instead of Session mode (5432)
if (process.env.NODE_ENV === "production" && finalConnectionString) {
  try {
    const url = new URL(finalConnectionString);
    
    // Only alter the port if it's the known Supabase pooler host
    if (url.hostname.includes("pooler.supabase.com")) {
      if (url.port === "5432" || !url.port) {
        url.port = "6543";
      }
      url.searchParams.set("pgbouncer", "true");
      finalConnectionString = url.toString();
    }
  } catch (error) {
    console.warn("⚠️ Warning: Failed to parse Postgres URL in prisma.ts");
  }
}

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> };

// In development, we use a global variable to prevent opening multiple 
// connections to the database on hot reloads
const createPrismaClient = () => {
  const pool = new Pool({ 
    connectionString: finalConnectionString,
    // Vercel serverless functions should not locally pool too many connections
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    idleTimeoutMillis: process.env.NODE_ENV === "production" ? 5000 : 30000, 
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });
  
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

