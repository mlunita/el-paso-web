import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteSupportCategoryAction, DeleteSupportEntryAction } from "./client-actions";

function getCategoryVisibilityBadgeClass(visibility: string) {
  return visibility === "PUBLIC" ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-500/20 text-zinc-300";
}

function getEntryStatusBadgeClass(status: string) {
  return status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/20 text-yellow-300";
}

function getEntryVisibilityBadgeClass(visibility: string) {
  if (visibility === "PUBLIC") return "bg-blue-500/20 text-blue-300";
  if (visibility === "UNLISTED") return "bg-purple-500/20 text-purple-300";
  return "bg-zinc-500/20 text-zinc-300";
}

export default async function SupportAdminPage() {
  const [categories, entries] = await Promise.all([
    prisma.supportCategory.findMany({
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
    prisma.supportEntry.findMany({
      include: {
        category: true,
      },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black">Support Archive</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage quiet FAQ, support, and newsroom-style content without changing the main news flow.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/support/categories/create" className="bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg font-bold transition-colors border border-white/10">
            Create Category
          </Link>
          <Link href="/admin/support/entries/create" className="bg-[#a67c52] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors">
            Create Entry
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Categories</h2>
            <p className="text-zinc-500 text-sm">Control order and public visibility for each section.</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white font-bold">Category</TableHead>
                <TableHead className="text-white font-bold">Visibility</TableHead>
                <TableHead className="text-white font-bold">Order</TableHead>
                <TableHead className="text-white font-bold">Entries</TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 && (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={5} className="text-center py-8 text-white/50">
                    No support categories yet.
                  </TableCell>
                </TableRow>
              )}
              {categories.map((category) => (
                <TableRow key={category.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-bold">{category.name}</div>
                      <div className="text-xs text-white/30">/support/{category.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryVisibilityBadgeClass(category.visibility)}>
                      {category.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">{category.order}</TableCell>
                  <TableCell className="text-zinc-400">{category._count.entries}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/support/categories/edit/${category.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm">
                        Edit
                      </Link>
                      <DeleteSupportCategoryAction id={category.id} name={category.name} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black">Entries</h2>
          <p className="text-zinc-500 text-sm">Use custom bylines, manage visibility, and control ordering without touching the existing news posts.</p>
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white font-bold">Entry</TableHead>
                <TableHead className="text-white font-bold">Category</TableHead>
                <TableHead className="text-white font-bold">State</TableHead>
                <TableHead className="text-white font-bold">Publish Date</TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 && (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={5} className="text-center py-8 text-white/50">
                    No support entries yet.
                  </TableCell>
                </TableRow>
              )}
              {entries.map((entry) => (
                <TableRow key={entry.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-bold">{entry.title}</div>
                      <div className="text-xs text-white/30">
                        {entry.authorName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{entry.category.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getEntryStatusBadgeClass(entry.status)}>{entry.status}</Badge>
                      <Badge className={getEntryVisibilityBadgeClass(entry.visibility)}>{entry.visibility}</Badge>
                      {entry.featured && <Badge className="bg-[#a67c52]/20 text-[#c9a87c]">FEATURED</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {entry.publishedAt ? new Date(entry.publishedAt).toLocaleString() : "Not set"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/support/entries/edit/${entry.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm">
                        Edit
                      </Link>
                      <DeleteSupportEntryAction id={entry.id} title={entry.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
