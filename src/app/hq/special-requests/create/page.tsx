import { requireAdminSession } from "@/lib/auth";
import { FormBuilderClient } from "../form-builder-client";

export default async function CreateSpecialRequestPage() {
  await requireAdminSession();
  return <FormBuilderClient />;
}
