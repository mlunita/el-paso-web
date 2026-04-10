"use client";

import { useActionState, useEffect, useState } from "react";
import { createPost, updatePost } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function PostForm({ post }: { post?: any }) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");

  const updateFn = post ? updatePost.bind(null, post.id) : createPost;
  const [state, formAction, pending] = useActionState(updateFn, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(post ? "Post updated successfully" : "Post created successfully");
      router.push("/admin/posts");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, post]);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-400 font-bold">Post Title</Label>
        <Input 
          id="title" 
          name="title" 
          required 
          defaultValue={post?.title} 
          placeholder="Enter post title..." 
          className="bg-black/50 border-white/10 focus-visible:ring-violet-500/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage" className="text-zinc-400 font-bold">Cover Image URL</Label>
        <Input 
          id="coverImage" 
          name="coverImage" 
          value={coverImage} 
          onChange={(e) => setCoverImage(e.target.value)} 
          placeholder="https://example.com/image.jpg" 
          className="bg-black/50 border-white/10 focus-visible:ring-violet-500/50"
        />
        {coverImage && (
          <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
            <Image src={coverImage} alt="Cover Preview" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-zinc-400 font-bold">Post Content</Label>
        <Textarea 
          id="content" 
          name="content" 
          required 
          defaultValue={post?.content} 
          placeholder="Write your content here..." 
          className="min-h-[200px] bg-black/50 border-white/10 focus-visible:ring-violet-500/50"
        />
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          id="published" 
          name="published" 
          defaultChecked={post?.published} 
          className="w-5 h-5 rounded border-white/10 bg-black/50 accent-violet-600"
        />
        <Label htmlFor="published" className="text-zinc-300 font-bold cursor-pointer">Publish immediately</Label>
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/admin/posts")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold">
          {pending ? "Saving..." : "Save Post"}
        </Button>
      </div>
    </form>
  );
}
