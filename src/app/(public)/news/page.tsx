import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";
import { formatDate } from "@/lib/i18n";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();

  return createLocalizedMetadata({
    locale,
    path: "/news",
    title: t.seo.pages.news.title,
    description: t.seo.pages.news.description,
    twitterCard: "summary",
  });
}

export default async function NewsPage() {
  const locale = await getRequestLocale();
  const t = await getTranslations();
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="ep-section py-8 sm:py-12">
      <div className="ep-section-inner">
        <SectionHeading title={t.news.heading} subtitle={t.news.subtitle} icon={Newspaper} />

        {posts.length === 0 ? (
          <div className="ep-card rounded-2xl border-dashed min-h-[400px] flex flex-col items-center justify-center text-[var(--ep-text-muted)] gap-5 ep-fade-up">
            <div className="relative">
              <Newspaper className="w-14 h-14 text-[var(--ep-text-muted)] ep-float" />
              <div className="absolute inset-0 bg-[var(--ep-accent)]/10 blur-2xl rounded-full" />
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-widest">{t.news.noNewsTitle}</span>
            <p className="text-sm">{t.news.noNewsDescription}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {featuredPost && (
              <Link href={`/news/${featuredPost.id}`} className="group block ep-fade-up">
                <article className="ep-card rounded-2xl overflow-hidden relative">
                  {featuredPost.coverImage && (
                    <div className="w-full h-48 sm:h-64 md:h-80 relative overflow-hidden bg-[var(--ep-bg-surface)]">
                      <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ep-bg-surface)] via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[var(--ep-accent-muted)] text-[var(--ep-accent)] text-[11px] font-bold uppercase tracking-wider border border-[var(--ep-border-accent)]">
                        {t.news.latest}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--ep-text-muted)]">
                        <Calendar className="w-3 h-3" />
                        <time>{formatDate(featuredPost.createdAt, locale)}</time>
                      </div>
                    </div>
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-extrabold text-[var(--ep-text-primary)] group-hover:text-[var(--ep-accent)] transition-colors duration-300 mb-3 line-clamp-2">
                      {featuredPost.title}
                    </h2>
                    <p className="text-[var(--ep-text-secondary)] line-clamp-3 text-sm leading-relaxed max-w-3xl">
                      {featuredPost.content}
                    </p>
                    <div className="mt-5 flex items-center text-[var(--ep-accent)] font-bold uppercase tracking-wider text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                      {t.common.readArticle} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {remainingPosts.map((post, index) => (
                  <Link key={post.id} href={`/news/${post.id}`} className="group h-full ep-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
                    <article className="h-full ep-card rounded-2xl overflow-hidden flex flex-col">
                      {post.coverImage && (
                        <div className="w-full h-40 sm:h-48 relative overflow-hidden bg-[var(--ep-bg-surface)] shrink-0">
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ep-bg-surface)] to-transparent" />
                        </div>
                      )}
                      <div className="p-5 sm:p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--ep-text-muted)] mb-3">
                          <Calendar className="w-3 h-3" />
                          <time>{formatDate(post.createdAt, locale)}</time>
                        </div>
                        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[var(--ep-text-primary)] group-hover:text-[var(--ep-accent)] transition-colors duration-300 mb-3 line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-[var(--ep-text-secondary)] line-clamp-3 text-sm leading-relaxed flex-1">{post.content}</p>
                        <div className="mt-4 pt-4 border-t border-[var(--ep-border)] flex items-center text-[var(--ep-accent)] font-bold uppercase tracking-wider text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                          {t.common.readArticle} <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
