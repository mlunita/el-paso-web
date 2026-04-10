import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post = null;
  try {
    post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  } catch (e) {
    // Handling error or DB empty state
  }

  if (!post) {
    return notFound();
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-4 animate-fade-in-up">
      <Link href="/news" className="inline-flex items-center gap-2 text-zinc-500 hover:text-violet-400 transition-colors duration-300 mb-8 font-semibold w-fit group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" /> Back to News
      </Link>

      <article className="w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-zinc-500 mb-10 border-y border-white/5 py-4 font-medium uppercase tracking-wider text-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-500/10 rounded-lg">
              <User className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="text-zinc-300">{post.author?.name || "Admin"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-500/10 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        {post.coverImage && (
          <div className="w-full rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-black/30 border border-white/5 relative bg-zinc-900 group">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 bottom-0 top-[60%]" />
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full max-h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        )}
        
        <div className="prose prose-invert prose-zinc max-w-none prose-lg md:prose-xl prose-p:leading-relaxed prose-headings:font-black prose-a:text-violet-400 hover:prose-a:text-violet-300">
          {post.content.split("\n").map((line, i) => {
            if (line.trim() === "") return <br key={i} />;
            if (line.startsWith("# ")) return <h1 key={i} className="text-3xl md:text-4xl mt-12 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">{line.replace("# ", "")}</h1>;
            if (line.startsWith("## ")) return <h2 key={i} className="text-2xl md:text-3xl mt-10 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">{line.replace("## ", "")}</h2>;
            return <p key={i} className="text-zinc-400 mb-6">{line}</p>;
          })}
        </div>
      </article>
    </div>
  );
}
