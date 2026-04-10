import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Get the connection string from environment variable
const connectionString = process.env.DATABASE_URL;

async function main() {
  console.log('Seeding admin user...');

  // Set up Prisma Client with the pg adapter
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: passwordHash,
        name: 'Super Admin',
        role: 'ADMIN',
      },
    });

    console.log('Seeding complete! Admin created:', admin.email);

    // Initial site settings
    const existingSettings = await prisma.siteSettings.findFirst();
    if (!existingSettings) {
      await prisma.siteSettings.create({
        data: {
          bannerTitle: "WELCOME TO THE NEXUS",
          bannerSubtitle: "Your gaming journey begins here",
          description: "Join the largest community of gamers out there. We provide news, updates, and more.",
          appsOpen: true,
        },
      });
      console.log('Initial site settings created.');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    // Also disconnect the pg pool to exit cleanly
    await pool.end();
  }
}

main();
