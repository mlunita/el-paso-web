"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function generateRefCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function submitSpecialRequest(formId: string, discord: string, roblox: string, responses: any) {
  try {
    const form = await prisma.specialRequestForm.findUnique({ where: { id: formId } });
    if (!form || !form.isActive) {
      return { success: false, error: "Form not found or inactive" };
    }

    let refCode = "";
    let isUnique = false;
    while (!isUnique) {
      refCode = generateRefCode(8); // e.g. ABC123XY
      const existing = await prisma.specialRequestSubmission.findUnique({ where: { refCode } });
      if (!existing) isUnique = true;
    }

    const submission = await prisma.specialRequestSubmission.create({
      data: {
        refCode,
        formId,
        discord,
        roblox,
        responses: JSON.stringify(responses),
        status: "PENDING",
      },
    });

    return { success: true, refCode: submission.refCode };
  } catch (error: any) {
    console.error("Error submitting special request:", error);
    return { success: false, error: "Failed to submit request" };
  }
}
