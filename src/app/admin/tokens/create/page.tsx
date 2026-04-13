import { prisma } from "@/lib/prisma";
import { TokenForm } from "../client-form";

export default async function CreateTokenPage() {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Generate Moderator Token</h1>
        <p className="text-white/30 text-sm mt-1">
          Create a new access token for a moderator. The token will be shown only once.
        </p>
      </div>
      <TokenForm roles={roles} />
    </div>
  );
}
