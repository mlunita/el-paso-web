"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Settings
export async function updateSettings(prevState: any, formData: FormData) {
  try {
    const data = {
      bannerImage: formData.get("bannerImage") as string || null,
      bannerTitle: formData.get("bannerTitle") as string,
      bannerSubtitle: formData.get("bannerSubtitle") as string,
      description: formData.get("description") as string,
      appsOpen: formData.get("appsOpen") === "on",
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
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteStaff(id: string) {
  await prisma.staffMember.delete({ where: { id } });
  revalidatePath("/admin/staff");
  revalidatePath("/applys");
}

// Posts
export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/news");
}

export async function togglePublishPost(id: string, published: boolean) {
  await prisma.post.update({ where: { id }, data: { published } });
  revalidatePath("/admin/posts");
  revalidatePath("/news");
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
        coverImage: formData.get("coverImage") as string || null,
        published: formData.get("published") === "on",
        authorId: user.id,
      }
    });

    revalidatePath("/admin/posts");
    revalidatePath("/news");
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
        coverImage: formData.get("coverImage") as string || null,
        published: formData.get("published") === "on",
      }
    });

    revalidatePath("/admin/posts");
    revalidatePath("/news");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
