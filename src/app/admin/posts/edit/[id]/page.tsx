import { prisma } from "@/lib/prisma";
import { PostForm } from "../../client-form";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) return notFound();

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Edit Post</h1>
        <p className="text-zinc-500 text-sm mt-1">Update the content or status of your post.</p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
