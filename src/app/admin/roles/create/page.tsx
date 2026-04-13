import { prisma } from "@/lib/prisma";
import { RoleForm } from "../client-form";

export default async function CreateRolePage() {
  const allPermissions = await prisma.permission.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Create Role</h1>
        <p className="text-white/30 text-sm mt-1">Define a new moderator role with specific permissions</p>
      </div>
      <RoleForm allPermissions={allPermissions} />
    </div>
  );
}
