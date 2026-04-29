"use client";

import { useActionState, useEffect, useState } from "react";
import { createPost, updatePost } from "@/app/hq/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useI18n } from "@/components/i18n-provider";

export function PostForm({ post }: { post?: any }) {
  const router = useRouter();
  const { t } = useI18n();
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");

  const updateFn = post ? updatePost.bind(null, post.id) : createPost;
  const [state, formAction, pending] = useActionState(updateFn, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(post ? t.admin.posts.toastUpdated : t.admin.posts.toastCreated);
      router.push("/hq/posts");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, post]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-400 font-bold">{t.admin.posts.postTitle}</Label>
        <Input 
          id="title" 
          name="title" 
          required 
          defaultValue={post?.title} 
          placeholder={t.admin.posts.placeholders.title}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="authorName" className="text-zinc-400 font-bold">{t.admin.posts.authorName}</Label>
        <Input 
          id="authorName" 
          name="authorName" 
          required 
          defaultValue={post?.authorName} 
          placeholder={t.admin.posts.placeholders.author}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage" className="text-zinc-400 font-bold">{t.admin.posts.coverImage}</Label>
        <Input 
          id="coverImage" 
          name="coverImage" 
          value={coverImage} 
          onChange={(e) => setCoverImage(e.target.value)} 
          placeholder="https://example.com/image.jpg" 
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
        {coverImage && (
          <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
            <Image src={coverImage} alt={t.admin.posts.coverPreview} fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-zinc-400 font-bold">{t.admin.posts.content}</Label>
        <Textarea 
          id="content" 
          name="content" 
          required 
          defaultValue={post?.content} 
          placeholder={t.admin.posts.placeholders.content}
          className="min-h-[200px] bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          id="published" 
          name="published" 
          defaultChecked={post?.published} 
          className="w-5 h-5 rounded border-white/10 bg-black/50 accent-[var(--ep-accent)]"
        />
        <Label htmlFor="published" className="text-zinc-300 font-bold cursor-pointer">{t.admin.posts.publishImmediately}</Label>
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/hq/posts")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[var(--ep-accent)] hover:bg-[#956e47] text-white font-bold">
          {pending ? t.common.saving : t.admin.posts.savePost}
        </Button>
      </div>
    </form>
  );
}
