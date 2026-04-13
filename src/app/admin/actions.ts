"use server";

import { prisma } from "@/lib/prisma";
import { inspectWikiImageUrl } from "@/lib/wiki-image-url";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Settings
export async function updateSettings(prevState: any, formData: FormData) {
  try {
    const data = {
      bannerImage: formData.get("bannerImage") as string || null,
      bannerTitle: formData.get("bannerTitle") as string,
      bannerSubtitle: formData.get("bannerSubtitle") as string,
      description: formData.get("description") as string,
      appsOpen: formData.get("appsOpen") === "on",
      ticketStatus: formData.get("ticketStatus") as string || "GREEN",
    };

    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      await prisma.siteSettings.create({ data });
    } else {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    revalidatePath("/");
    revalidatePath("/applys");
    revalidatePath("/ticket-status");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Applications
export async function updateApplicationStatus(id: string, status: string, notes?: string) {
  await prisma.application.update({
    where: { id },
    data: { status, notes },
  });
  revalidatePath("/admin/applications");
  revalidatePath("/status");
  revalidatePath("/admin");
}

// Staff
export async function createStaff(prevState: any, formData: FormData) {
  try {
    await prisma.staffMember.create({
      data: {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        image: formData.get("image") as string || null,
        order: parseInt(formData.get("order") as string) || 0,
      }
    });
    revalidatePath("/admin/staff");
    revalidatePath("/applys");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateStaff(id: string, prevState: any, formData: FormData) {
  try {
    await prisma.staffMember.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        role: formData.get("role") as string,
        image: formData.get("image") as string || null,
        order: parseInt(formData.get("order") as string) || 0,
      }
    });
    revalidatePath("/admin/staff");
    revalidatePath("/applys");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStaff(id: string) {
  await prisma.staffMember.delete({ where: { id } });
  revalidatePath("/admin/staff");
  revalidatePath("/applys");
  revalidatePath("/admin");
}

// Posts
export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath("/admin");
}

export async function togglePublishPost(id: string, published: boolean) {
  await prisma.post.update({ where: { id }, data: { published } });
  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath("/admin");
}

export async function createPost(prevState: any, formData: FormData) {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { email: "admin@temp.gg", password: "none", name: "System Admin" } });
    }

    await prisma.post.create({
      data: {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        authorName: formData.get("authorName") as string || null,
        coverImage: formData.get("coverImage") as string || null,
        published: formData.get("published") === "on",
        authorId: user.id,
      }
    });

    revalidatePath("/admin/posts");
    revalidatePath("/news");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updatePost(id: string, prevState: any, formData: FormData) {
  try {
    await prisma.post.update({
      where: { id },
      data: {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        authorName: formData.get("authorName") as string || null,
        coverImage: formData.get("coverImage") as string || null,
        published: formData.get("published") === "on",
      }
    });

    revalidatePath("/admin/posts");
    revalidatePath("/news");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Wiki Items
export async function createWikiItem(prevState: any, formData: FormData) {
  try {
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
      }
    });
    revalidatePath("/admin/wiki");
    revalidatePath("/wiki");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateWikiItem(id: string, prevState: any, formData: FormData) {
  try {
    const imageInspection = inspectWikiImageUrl(formData.get("image") as string | null);
    if (imageInspection.issue) {
      return { success: false, error: imageInspection.issue };
    }

    await prisma.wikiItem.update({
      where: { id },
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        section: formData.get("section") as string,
        image: imageInspection.normalizedUrl,
        order: parseInt(formData.get("order") as string) || 0,
        tags: formData.get("tags") as string || null,
        customFields: formData.get("customFields") as string || null,
      }
    });
    revalidatePath("/admin/wiki");
    revalidatePath("/wiki");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteWikiItem(id: string) {
  await prisma.wikiItem.delete({ where: { id } });
  revalidatePath("/admin/wiki");
  revalidatePath("/wiki");
  revalidatePath("/admin");
}

// =====================================================
// Roles
// =====================================================

export async function createRole(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string || null;
    const permissionIds = formData.getAll("permissions") as string[];

    await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateRole(id: string, prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string || null;
    const permissionIds = formData.getAll("permissions") as string[];

    await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: {
          set: permissionIds.map((pid) => ({ id: pid })),
        },
      },
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteRole(id: string) {
  // Check if any tokens use this role
  const tokenCount = await prisma.moderatorToken.count({ where: { roleId: id } });
  if (tokenCount > 0) {
    throw new Error("Cannot delete a role that has moderator tokens assigned. Revoke tokens first.");
  }
  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/roles");
  revalidatePath("/admin");
}

// =====================================================
// Moderator Tokens
// =====================================================

export async function generateModeratorToken(prevState: any, formData: FormData) {
  try {
    const moderatorName = formData.get("moderatorName") as string;
    const moderatorId = formData.get("moderatorId") as string;
    const roleId = formData.get("roleId") as string;

    // Generate a secure random token
    const plainToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = await bcrypt.hash(plainToken, 10);
    const tokenPreview = "…" + plainToken.slice(-6);

    // Get role permissions for snapshot
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    const permSnapshot = JSON.stringify(role.permissions.map((p: { key: string }) => p.key));

    await prisma.moderatorToken.create({
      data: {
        tokenHash,
        tokenPreview,
        moderatorName,
        moderatorId,
        roleId,
        permSnapshot,
      },
    });

    revalidatePath("/admin/tokens");
    revalidatePath("/admin");
    return { success: true, token: plainToken };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function revokeModeratorToken(id: string) {
  await prisma.moderatorToken.update({
    where: { id },
    data: { status: "REVOKED" },
  });
  revalidatePath("/admin/tokens");
  revalidatePath("/admin");
}

export async function reactivateModeratorToken(id: string) {
  await prisma.moderatorToken.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/admin/tokens");
  revalidatePath("/admin");
}

// =====================================================
// Ban Request Management (Admin side)
// =====================================================

export async function updateBanRequestStatus(
  id: string,
  status: string,
  adminNotes?: string
) {
  const request = await prisma.banRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Ban request not found");

  await prisma.banRequest.update({
    where: { id },
    data: {
      status,
      adminNotes: adminNotes || request.adminNotes,
      reviewedBy: "admin",
      reviewedAt: new Date(),
    },
  });

  await prisma.banRequestAuditLog.create({
    data: {
      banRequestId: id,
      action: "STATUS_CHANGED",
      fromStatus: request.status,
      toStatus: status,
      performedBy: "admin",
      details: adminNotes || null,
    },
  });

  revalidatePath("/admin/ban-requests");
  revalidatePath(`/admin/ban-requests/${id}`);
  revalidatePath("/mod");
  revalidatePath("/admin");
}

export async function addBanRequestNote(id: string, note: string) {
  const request = await prisma.banRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Ban request not found");

  const existingNotes = request.adminNotes || "";
  const timestamp = new Date().toISOString();
  const updatedNotes = existingNotes
    ? `${existingNotes}\n\n[${timestamp}] ${note}`
    : `[${timestamp}] ${note}`;

  await prisma.banRequest.update({
    where: { id },
    data: { adminNotes: updatedNotes },
  });

  await prisma.banRequestAuditLog.create({
    data: {
      banRequestId: id,
      action: "NOTE_ADDED",
      performedBy: "admin",
      details: note,
    },
  });

  revalidatePath(`/admin/ban-requests/${id}`);
  revalidatePath("/admin/ban-requests");
}
