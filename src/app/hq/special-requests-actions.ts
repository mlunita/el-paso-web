"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminCreateSpecialRequestForm(data: { title: string; description: string; fields: string; isActive: boolean }) {
  try {
    const form = await prisma.specialRequestForm.create({
      data: {
        title: data.title,
        description: data.description || null,
        fields: data.fields,
        isActive: data.isActive,
      },
    });
    revalidatePath("/hq/special-requests");
    revalidatePath("/special-requests");
    return { success: true, form };
  } catch (error: any) {
    console.error("Error creating form:", error);
    return { success: false, error: "Failed to create form" };
  }
}

export async function adminUpdateSpecialRequestForm(id: string, data: { title: string; description: string; fields: string; isActive: boolean }) {
  try {
    const form = await prisma.specialRequestForm.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        fields: data.fields,
        isActive: data.isActive,
      },
    });
    revalidatePath("/hq/special-requests");
    revalidatePath("/special-requests");
    revalidatePath(`/hq/special-requests/edit/${id}`);
    return { success: true, form };
  } catch (error: any) {
    console.error("Error updating form:", error);
    return { success: false, error: "Failed to update form" };
  }
}

export async function adminToggleSpecialRequestForm(id: string, isActive: boolean) {
  try {
    await prisma.specialRequestForm.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/hq/special-requests");
    revalidatePath("/special-requests");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling form:", error);
    return { success: false, error: "Failed to toggle form" };
  }
}

export async function adminDeleteSpecialRequestForm(id: string) {
  try {
    await prisma.specialRequestForm.delete({
      where: { id },
    });
    revalidatePath("/hq/special-requests");
    revalidatePath("/special-requests");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting form:", error);
    return { success: false, error: "Failed to delete form. Make sure there are no submissions attached to it." };
  }
}

export async function adminUpdateSubmissionStatus(id: string, status: string, notes: string) {
  try {
    const submission = await prisma.specialRequestSubmission.update({
      where: { id },
      data: { status, notes: notes || null },
    });
    revalidatePath(`/hq/special-requests/${submission.formId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating submission:", error);
    return { success: false, error: "Failed to update submission status" };
  }
}
