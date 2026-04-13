"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ApplySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  links: z.string().optional(),
});

export async function submitApplication(prevState: any, formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
      links: formData.get("links") as string,
    };

    const validated = ApplySchema.parse(data);

    // simple ref generation (8 chars)
    const refCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const app = await prisma.application.create({
      data: {
        ...validated,
        refCode,
      },
    });

    return { success: true, refCode: app.refCode };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const e = error as any;
      return { success: false, error: e.errors?.[0]?.message || "Validation Error" };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
