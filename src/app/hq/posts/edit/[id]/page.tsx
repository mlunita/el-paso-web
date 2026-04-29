import { prisma } from "@/lib/prisma";
import { PostForm } from "../../client-form";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/server";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations();
  const post = await prisma.post.findUnique({
    where: { id }
  });

  if (!post) return notFound();

  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.posts.editTitle}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t.admin.posts.editSubtitle}</p>
      </div>
      <PostForm post={post} />
    </div>
  );
}
