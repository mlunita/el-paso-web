import { getModSession } from "@/lib/mod-auth";
import { redirect } from "next/navigation";
import { ModWikiForm } from "./client-form";

export default async function ModCreateWikiPage() {
  const session = await getModSession();
  if (!session) redirect("/mod-login");

  if (!session.permissions.includes("create_wiki_items")) {
    return (
      <div className="text-center py-16 text-white/50">
        <p className="font-bold">Access Denied</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Create Wiki Item</h1>
        <p className="text-white/30 text-sm mt-1">
          Creating as <span className="text-[var(--ep-secondary)] font-bold">{session.modName}</span>
        </p>
      </div>
      <ModWikiForm />
    </div>
  );
}
