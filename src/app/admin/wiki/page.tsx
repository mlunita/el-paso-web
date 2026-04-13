import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DeleteWikiAction } from "./client-actions";

const SECTION_COLORS: Record<string, string> = {
  GAMEPASS: "bg-amber-500/20 text-amber-300",
  WEAPONS: "bg-red-500/20 text-red-300",
  EQUIPMENT: "bg-blue-500/20 text-blue-300",
  CARS: "bg-emerald-500/20 text-emerald-300",
  TEAMS: "bg-purple-500/20 text-purple-300",
};

export default async function WikiAdminPage() {
  const items = await prisma.wikiItem.findMany({
    orderBy: [{ section: "asc" }, { order: "asc" }],
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Manage Wiki</h1>
        <Link href="/admin/wiki/create" className="bg-[#a67c52] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors">Add Wiki Item</Link>
      </div>
      
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Title</TableHead>
              <TableHead className="text-white font-bold">Section</TableHead>
              <TableHead className="text-white font-bold">Order</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={4} className="text-center py-8 text-white/50">
                  No wiki items added yet.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-bold">{item.title}</TableCell>
                <TableCell>
                  <Badge className={SECTION_COLORS[item.section] || "bg-zinc-500/20 text-zinc-300"}>
                    {item.section}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-400">{item.order}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/wiki/edit/${item.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm">Edit</Link>
                    <DeleteWikiAction id={item.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
