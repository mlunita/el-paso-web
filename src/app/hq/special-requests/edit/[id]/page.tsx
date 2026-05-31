import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FormBuilderClient } from "../../form-builder-client";
import { notFound } from "next/navigation";

export default async function EditSpecialRequestPage({ params }: { params: { id: string } }) {
  await requireAdminSession();

  const form = await prisma.specialRequestForm.findUnique({
    where: { id: params.id },
  });

  if (!form) return notFound();

  return <FormBuilderClient initialData={form} />;
}
