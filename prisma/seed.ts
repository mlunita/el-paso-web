import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Get the connection string from environment variable
const connectionString = process.env.DATABASE_URL;

const DEFAULT_PERMISSIONS = [
  { key: "view_mod_panel", label: "View Mod Panel" },
  { key: "create_ban_requests", label: "Create Ban Requests" },
  { key: "view_own_ban_requests", label: "View Own Ban Requests" },
  { key: "view_request_status", label: "View Request Status" },
  { key: "create_wiki_items", label: "Create Wiki Items" },
  { key: "create_posts", label: "Create Posts" },
  { key: "edit_content", label: "Edit Content" },
  { key: "review_ban_logs", label: "Review Ban Logs" },
  { key: "manage_roles_tokens", label: "Manage Roles & Tokens" },
  { key: "manage_moderator_access", label: "Manage Moderator Access" },
  // Shift Management
  { key: "manage_shifts", label: "Manage Shifts (Clock In/Out)" },
  { key: "view_shifts", label: "View Own Shifts" },
  // Moderation Action Registry
  { key: "create_mod_actions", label: "Create Mod Actions" },
  { key: "view_mod_actions", label: "View Own Mod Actions" },
  // Roblox Lookup
  { key: "roblox_lookup", label: "Roblox User Lookup" },
];

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

    // Seed default permissions
    console.log('Seeding permissions...');
    for (const perm of DEFAULT_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { key: perm.key },
        update: { label: perm.label },
        create: { key: perm.key, label: perm.label },
      });
    }
    console.log(`Seeded ${DEFAULT_PERMISSIONS.length} permissions.`);

    // Seed default "Moderator" role
    const allPerms = await prisma.permission.findMany({
      where: {
        key: {
          in: ["view_mod_panel", "create_ban_requests", "view_own_ban_requests", "view_request_status"],
        },
      },
    });

    await prisma.role.upsert({
      where: { name: "Moderator" },
      update: {},
      create: {
        name: "Moderator",
        description: "Default moderator role with basic permissions",
        permissions: {
          connect: allPerms.map((p: { id: string }) => ({ id: p.id })),
        },
      },
    });
    console.log('Default "Moderator" role created.');

    // Seed "Senior Moderator" role with more permissions
    const seniorPerms = await prisma.permission.findMany({
      where: {
        key: {
          in: [
            "view_mod_panel", "create_ban_requests", "view_own_ban_requests",
            "view_request_status", "create_wiki_items", "create_posts",
            "review_ban_logs",
            "manage_shifts", "view_shifts",
            "create_mod_actions", "view_mod_actions",
            "roblox_lookup",
          ],
        },
      },
    });

    await prisma.role.upsert({
      where: { name: "Senior Moderator" },
      update: {},
      create: {
        name: "Senior Moderator",
        description: "Senior moderator with content creation and ban review permissions",
        permissions: {
          connect: seniorPerms.map((p: { id: string }) => ({ id: p.id })),
        },
      },
    });
    console.log('Default "Senior Moderator" role created.');

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
