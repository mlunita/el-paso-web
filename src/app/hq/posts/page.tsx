import { prisma } from "@/lib/prisma";
import { PostActions } from "./client-actions";
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

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Manage Posts</h1>
        <Link href="/hq/posts/create" className="bg-[#a67c52] hover:bg-[#956e47] text-white py-2 px-4 rounded-lg font-bold transition-colors">Create Post</Link>
      </div>
      
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-bold">Title</TableHead>
              <TableHead className="text-white font-bold">Date</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableCell colSpan={4} className="text-center py-8 text-white/50">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-bold">{post.title}</TableCell>
                <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={
                    post.published ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }>
                    {post.published ? 'PUBLISHED' : 'DRAFT'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link href={`/hq/posts/edit/${post.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm">
                      Edit
                    </Link>
                    <PostActions id={post.id} published={post.published} />
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
