import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ShiftsClient from "./shifts-client";

export default async function AdminShiftsPage() {
  try {
    await requireAdminSession();
  } catch {
    redirect("/hq-login");
  }

  const [activeShifts, recentShifts, uniqueMods] = await Promise.all([
    prisma.modShift.findMany({
      where: { status: { in: ["ACTIVE", "PAUSED"] } },
      include: { breaks: true },
      orderBy: { clockIn: "asc" },
    }),
    prisma.modShift.findMany({
      orderBy: { clockIn: "desc" },
      take: 50,
      include: { breaks: true },
    }),
    prisma.modShift.findMany({
      select: { modId: true, modName: true },
      distinct: ["modId"],
    }),
  ]);

  return (
    <ShiftsClient
      activeShifts={JSON.parse(JSON.stringify(activeShifts))}
      recentShifts={JSON.parse(JSON.stringify(recentShifts))}
      uniqueMods={uniqueMods}
    />
  );
}
