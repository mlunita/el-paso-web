import { getModSession } from "@/lib/mod-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ModPostsPage() {
  const session = await getModSession();
  if (!session) redirect("/mod-login");

  if (!session.permissions.includes("create_posts")) {
    return (
      <div className="text-center py-16 text-white/50">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400/50" />
        <p className="font-bold">Access Denied</p>
        <p className="text-sm mt-1">You don&apos;t have permission to manage posts.</p>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--ep-secondary)]" />
            News Posts
          </h1>
          <p className="text-white/30 text-sm mt-1">Create news posts for the community</p>
        </div>
        <Link
          href="/mod/posts/create"
          className="flex items-center gap-2 bg-[var(--ep-secondary)] hover:bg-[#6b9471] text-white py-2 px-4 rounded-lg font-bold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Post
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Title</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={3} className="text-center py-8 text-white/50">
                  No posts yet.
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-bold">{post.title}</TableCell>
                <TableCell>
                  <Badge className={post.published ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}>
                    {post.published ? "PUBLISHED" : "DRAFT"}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/40 text-xs">
                  {new Date(post.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
