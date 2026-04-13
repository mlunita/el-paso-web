"use server";

import { prisma } from "@/lib/prisma";
import { inspectWikiImageUrl } from "@/lib/wiki-image-url";
import { getModSession, requireModPermission } from "@/lib/mod-auth";
import { revalidatePath } from "next/cache";

// =====================================================
// Ban Requests (Mod side)
// =====================================================

export async function createBanRequest(prevState: any, formData: FormData) {
  try {
    const session = await requireModPermission("create_ban_requests");

    const targetUserId = formData.get("targetUserId") as string;
    const targetUsername = formData.get("targetUsername") as string;
    const reason = formData.get("reason") as string;
    const notes = formData.get("notes") as string || null;

    // Parse evidence from JSON hidden field
    const evidenceRaw = formData.get("evidence") as string;
    let evidenceItems: { type: string; url: string; caption?: string }[] = [];
    if (evidenceRaw) {
      try {
        evidenceItems = JSON.parse(evidenceRaw);
      } catch {}
    }

    const banRequest = await prisma.banRequest.create({
      data: {
        tokenId: session.tokenId,
        modName: session.modName,
        modId: session.modId,
        modRole: session.roleName,
        modPermissions: JSON.stringify(session.permissions),
        targetUserId,
        targetUsername,
        reason,
        notes,
        evidence: {
          create: evidenceItems.map((e) => ({
            type: e.type,
            url: e.url,
            caption: e.caption || null,
          })),
        },
      },
    });

    // Create audit log
    await prisma.banRequestAuditLog.create({
      data: {
        banRequestId: banRequest.id,
        action: "CREATED",
        toStatus: "PENDING",
        performedBy: `mod:${session.modId}`,
        details: `Ban request created by ${session.modName}`,
      },
    });

    revalidatePath("/mod/ban-requests");
    revalidatePath("/mod");
    revalidatePath("/admin/ban-requests");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getMyBanRequests() {
  const session = await requireModPermission("view_own_ban_requests");
  return prisma.banRequest.findMany({
    where: { tokenId: session.tokenId },
    include: {
      _count: { select: { evidence: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// =====================================================
// Wiki (Mod side) — reuses admin logic with permission check
// =====================================================

export async function createWikiItemAsMod(prevState: any, formData: FormData) {
  try {
    await requireModPermission("create_wiki_items");
    const imageInspection = inspectWikiImageUrl(formData.get("image") as string | null);
    if (imageInspection.issue) {
      return { success: false, error: imageInspection.issue };
    }

    await prisma.wikiItem.create({
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        section: formData.get("section") as string,
        image: imageInspection.normalizedUrl,
        order: parseInt(formData.get("order") as string) || 0,
        tags: formData.get("tags") as string || null,
        customFields: formData.get("customFields") as string || null,
      },
    });

    revalidatePath("/mod/wiki");
    revalidatePath("/wiki");
    revalidatePath("/admin/wiki");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =====================================================
// Posts (Mod side) — reuses admin logic with permission check
// =====================================================

export async function createPostAsMod(prevState: any, formData: FormData) {
  try {
    await requireModPermission("create_posts");

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "admin@temp.gg", password: "none", name: "System Admin" },
      });
    }

    await prisma.post.create({
      data: {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        authorName: formData.get("authorName") as string || null,
        coverImage: formData.get("coverImage") as string || null,
        published: formData.get("published") === "on",
        authorId: user.id,
      },
    });

    revalidatePath("/mod/posts");
    revalidatePath("/news");
    revalidatePath("/admin/posts");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
