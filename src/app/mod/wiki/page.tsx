import { getModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus, BookOpen, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ModWikiPage() {
  const session = await getModSession();
  if (!session) redirect("/mod-login");

  if (!session.permissions.includes("create_wiki_items")) {
    return (
      <div className="text-center py-16 text-white/50">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400/50" />
        <p className="font-bold">Access Denied</p>
        <p className="text-sm mt-1">You don&apos;t have permission to manage wiki items.</p>
      </div>
    );
  }

  const items = await prisma.wikiItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[var(--ep-secondary)]" />
            Wiki Items
          </h1>
          <p className="text-white/30 text-sm mt-1">Create new wiki entries for the community</p>
        </div>
        <Link
          href="/mod/wiki/create"
          className="flex items-center gap-2 bg-[var(--ep-secondary)] hover:bg-[#6b9471] text-white py-2 px-4 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Item
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Title</TableHead>
              <TableHead className="text-white font-bold">Section</TableHead>
              <TableHead className="text-white font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={3} className="text-center py-8 text-white/50">
                  No wiki items yet.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-bold">{item.title}</TableCell>
                <TableCell>
                  <Badge className="bg-[var(--ep-secondary)]/20 text-[var(--ep-secondary)] border-[var(--ep-secondary)]/20 text-[9px]">
                    {item.section}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/40 text-xs">
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
