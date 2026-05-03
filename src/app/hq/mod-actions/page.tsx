import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModActionsClient from "./mod-actions-client";

export default async function AdminModActionsPage() {
  try {
    await requireAdminSession();
  } catch {
    redirect("/hq-login");
  }

  const [actions, uniqueMods, actionCounts] = await Promise.all([
    prisma.modAction.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { auditLogs: true } } },
    }),
    prisma.modAction.findMany({
      where: { deletedAt: null },
      select: { modId: true, modName: true },
      distinct: ["modId"],
    }),
    prisma.modAction.groupBy({
      by: ["reviewStatus"],
      where: { deletedAt: null },
      _count: { id: true },
    }),
  ]);

  const counts = {
    UNREVIEWED: actionCounts.find((c) => c.reviewStatus === "UNREVIEWED")?._count.id || 0,
    REVIEWED: actionCounts.find((c) => c.reviewStatus === "REVIEWED")?._count.id || 0,
    FLAGGED: actionCounts.find((c) => c.reviewStatus === "FLAGGED")?._count.id || 0,
    REJECTED: actionCounts.find((c) => c.reviewStatus === "REJECTED")?._count.id || 0,
  };

  return (
    <ModActionsClient
      actions={JSON.parse(JSON.stringify(actions))}
      uniqueMods={uniqueMods}
      counts={counts}
    />
  );
}
