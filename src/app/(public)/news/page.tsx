import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";

export default async function NewsPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    // console.error(e)
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col mb-2 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#a67c52] via-[#c9a87c] to-[#a67c52]">
          News &amp; Updates
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-[2px] w-12 bg-gradient-to-r from-[#a67c52] to-transparent rounded-full" />
          <p className="text-zinc-500 text-base sm:text-lg">Stay up to date with the latest from the portal.</p>
        </div>
      </div>

      <div className="w-full">
        {posts.length === 0 ? (
          <div className="w-full min-h-[400px] glass-card border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-500 gap-5 animate-fade-in-up">
            <div className="relative">
              <Newspaper className="w-16 h-16 text-zinc-700 animate-float" />
              <div className="absolute inset-0 bg-[#a67c52]/10 blur-2xl rounded-full" />
            </div>
            <span className="text-xl font-medium uppercase tracking-widest">No News Available</span>
            <p className="text-zinc-600 text-sm">Check back soon for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {posts.map((post, index) => (
              <Link key={post.id} href={`/news/${post.id}`} className="group h-full animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <article className="h-full glass-card hover:border-[#a67c52]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/15 flex flex-col relative">
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#a67c52]/10 to-transparent z-0 group-hover:from-[#a67c52]/20 transition-colors duration-500 pointer-events-none" />
                  
                  {post.coverImage && (
                    <div className="w-full h-40 sm:h-48 relative overflow-hidden bg-zinc-900 border-b border-white/5 shrink-0 z-10">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                    </div>
                  )}

                  <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-10">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a67c52]/80 mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <time>{new Date(post.createdAt).toLocaleDateString()}</time>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black mb-3 text-zinc-100 group-hover:text-white transition-colors duration-300 line-clamp-2">{post.title}</h2>

                    <p className="text-zinc-500 line-clamp-3 mb-6 flex-1 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    <div className="mt-auto flex items-center text-[#a67c52] font-bold uppercase tracking-wider text-sm group-hover:text-[#c9a87c] transition-colors duration-300 pt-4 border-t border-white/5">
                      Read Article <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
