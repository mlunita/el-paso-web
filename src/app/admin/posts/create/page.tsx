import { PostForm } from "../client-form";

export default function CreatePostPage() {
  return (
    <div>
      <div className="mb-8 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-black">Create New Post</h1>
        <p className="text-zinc-500 text-sm mt-1">Publish news and updates to the community portal.</p>
      </div>
      <PostForm />
    </div>
  );
}
