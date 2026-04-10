import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Create a connection pool with the PostgreSQL connection string
// Ensure DATABASE_URL is properly loaded via env vars 
const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// In development, we use a global variable to prevent opening multiple 
// connections to the database on hot reloads
const createPrismaClient = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
