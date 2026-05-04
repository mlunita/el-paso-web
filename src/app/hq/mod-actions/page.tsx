import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModActionsClient from "./mod-actions-client";
import { getAllModActions } from "../moderation-actions";

export default async function AdminModActionsPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  try {
    await requireAdminSession();
  } catch {
    redirect("/hq-login");
  }

  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) || 1 : 1;
  const modId = typeof searchParams.mod === "string" ? searchParams.mod : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  
  const pageSize = 50;

  const [{ actions, total }, uniqueMods, actionCounts] = await Promise.all([
    getAllModActions({ page, pageSize, modId, reviewStatus: status }),
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
      currentPage={page}
      totalPages={Math.ceil(total / pageSize)}
      totalActions={total}
    />
  );
}
