import { PostForm } from "../client-form";
import { getTranslations } from "@/lib/i18n/server";

export default async function CreatePostPage() {
  const t = await getTranslations();
  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">{t.admin.posts.createTitle}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t.admin.posts.createSubtitle}</p>
      </div>
      <PostForm />
    </div>
  );
}
