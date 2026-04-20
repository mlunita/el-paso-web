"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { inspectWikiImageUrl } from "@/lib/wiki-image-url";
import { slugifySupportValue } from "@/lib/support";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SUPPORT_CATEGORY_SCHEMA = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(80, "Category name is too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(80, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().max(280, "Description is too long").nullable(),
  visibility: z.enum(["PUBLIC", "HIDDEN"]),
  order: z.coerce.number().int().min(0, "Order must be 0 or higher").max(9999, "Order is too large"),
});

const SUPPORT_ENTRY_SCHEMA = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(140, "Title is too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  content: z.string().trim().min(20, "Content must be at least 20 characters"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  visibility: z.enum(["PUBLIC", "UNLISTED", "HIDDEN"]),
  order: z.coerce.number().int().min(0, "Order must be 0 or higher").max(9999, "Order is too large"),
  featured: z.boolean(),
  publishDate: z.string().trim().nullable(),
  authorName: z.string().trim().min(2, "Author name must be at least 2 characters").max(80, "Author name is too long"),
  categoryId: z.string().trim().min(1, "Select a category"),
});

function normalizeOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseSupportPublishDate(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Publish date is invalid");
  }

  return parsedDate;
}

function resolveSupportPublishedAt(status: "DRAFT" | "PUBLISHED", publishDate: string | null, existingPublishedAt?: Date | null) {
  const parsedDate = parseSupportPublishDate(publishDate);

  if (status === "PUBLISHED") {
    return parsedDate ?? existingPublishedAt ?? new Date();
  }

  return parsedDate;
}

function getActionErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || fallbackMessage;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(", ")
      : String(error.meta?.target ?? "");

    if (target.includes("slug")) {
      return "That slug is already in use.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

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

// =====================================================
// Support Categories
// =====================================================

export async function createSupportCategory(prevState: any, formData: FormData) {
  try {
    await requireAdminSession();

    const validated = SUPPORT_CATEGORY_SCHEMA.parse({
      name: formData.get("name"),
      slug: slugifySupportValue((formData.get("slug") as string) || (formData.get("name") as string) || ""),
      description: normalizeOptionalText(formData.get("description")),
      visibility: formData.get("visibility") || "PUBLIC",
      order: formData.get("order") || "0",
    });

    await prisma.supportCategory.create({
      data: validated,
    });

    revalidatePath("/admin/support");
    revalidatePath("/support");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error, "Unable to create category."),
    };
  }
}

export async function updateSupportCategory(id: string, prevState: any, formData: FormData) {
  try {
    await requireAdminSession();

    const existingCategory = await prisma.supportCategory.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    const validated = SUPPORT_CATEGORY_SCHEMA.parse({
      name: formData.get("name"),
      slug: slugifySupportValue((formData.get("slug") as string) || (formData.get("name") as string) || ""),
      description: normalizeOptionalText(formData.get("description")),
      visibility: formData.get("visibility") || "PUBLIC",
      order: formData.get("order") || "0",
    });

    await prisma.supportCategory.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/admin/support");
    revalidatePath("/support");
    revalidatePath(`/support/${existingCategory.slug}`);
    revalidatePath(`/support/${validated.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error, "Unable to update category."),
    };
  }
}

export async function deleteSupportCategory(id: string) {
  await requireAdminSession();

  const category = await prisma.supportCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category._count.entries > 0) {
    throw new Error("Delete or move the category entries first.");
  }

  await prisma.supportCategory.delete({ where: { id } });
  revalidatePath("/admin/support");
  revalidatePath("/support");
  revalidatePath(`/support/${category.slug}`);
}

// =====================================================
// Support Entries
// =====================================================

export async function createSupportEntry(prevState: any, formData: FormData) {
  try {
    await requireAdminSession();

    const validated = SUPPORT_ENTRY_SCHEMA.parse({
      title: formData.get("title"),
      slug: slugifySupportValue((formData.get("slug") as string) || (formData.get("title") as string) || ""),
      content: formData.get("content"),
      status: formData.get("status") || "DRAFT",
      visibility: formData.get("visibility") || "PUBLIC",
      order: formData.get("order") || "0",
      featured: formData.get("featured") === "on",
      publishDate: normalizeOptionalText(formData.get("publishDate")),
      authorName: formData.get("authorName"),
      categoryId: formData.get("categoryId"),
    });

    const category = await prisma.supportCategory.findUnique({
      where: { id: validated.categoryId },
      select: { id: true, slug: true },
    });

    if (!category) {
      throw new Error("Selected category does not exist");
    }

    const entry = await prisma.supportEntry.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        status: validated.status,
        visibility: validated.visibility,
        order: validated.order,
        featured: validated.featured,
        publishedAt: resolveSupportPublishedAt(validated.status, validated.publishDate),
        authorName: validated.authorName,
        authorId: null,
        categoryId: validated.categoryId,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/admin/support");
    revalidatePath("/support");
    revalidatePath(`/support/${category.slug}`);
    revalidatePath(`/support/${entry.category.slug}/${entry.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error, "Unable to create entry."),
    };
  }
}

export async function updateSupportEntry(id: string, prevState: any, formData: FormData) {
  try {
    await requireAdminSession();

    const existingEntry = await prisma.supportEntry.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!existingEntry) {
      throw new Error("Entry not found");
    }

    const validated = SUPPORT_ENTRY_SCHEMA.parse({
      title: formData.get("title"),
      slug: slugifySupportValue((formData.get("slug") as string) || (formData.get("title") as string) || ""),
      content: formData.get("content"),
      status: formData.get("status") || "DRAFT",
      visibility: formData.get("visibility") || "PUBLIC",
      order: formData.get("order") || "0",
      featured: formData.get("featured") === "on",
      publishDate: normalizeOptionalText(formData.get("publishDate")),
      authorName: formData.get("authorName"),
      categoryId: formData.get("categoryId"),
    });

    const category = await prisma.supportCategory.findUnique({
      where: { id: validated.categoryId },
      select: { id: true, slug: true },
    });

    if (!category) {
      throw new Error("Selected category does not exist");
    }

    const entry = await prisma.supportEntry.update({
      where: { id },
      data: {
        title: validated.title,
        slug: validated.slug,
        content: validated.content,
        status: validated.status,
        visibility: validated.visibility,
        order: validated.order,
        featured: validated.featured,
        publishedAt: resolveSupportPublishedAt(validated.status, validated.publishDate, existingEntry.publishedAt),
        authorName: validated.authorName,
        authorId: null,
        categoryId: validated.categoryId,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/admin/support");
    revalidatePath("/support");
    revalidatePath(`/support/${existingEntry.category.slug}`);
    revalidatePath(`/support/${existingEntry.category.slug}/${existingEntry.slug}`);
    revalidatePath(`/support/${entry.category.slug}`);
    revalidatePath(`/support/${entry.category.slug}/${entry.slug}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error, "Unable to update entry."),
    };
  }
}

export async function deleteSupportEntry(id: string) {
  await requireAdminSession();

  const entry = await prisma.supportEntry.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!entry) {
    throw new Error("Entry not found");
  }

  await prisma.supportEntry.delete({ where: { id } });
  revalidatePath("/admin/support");
  revalidatePath("/support");
  revalidatePath(`/support/${entry.category.slug}`);
  revalidatePath(`/support/${entry.category.slug}/${entry.slug}`);
}
