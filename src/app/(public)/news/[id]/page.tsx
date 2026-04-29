import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/i18n";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

type NewsDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } }).catch(() => null);

  if (!post) return { title: t.seo.pages.news.notFoundTitle };

  const description = post.content?.slice(0, 160).replace(/\n/g, " ") ?? t.seo.pages.news.fallbackDescription;
  return createLocalizedMetadata({
    locale,
    path: `/news/${id}`,
    title: post.title,
    description,
    type: "article",
    publishedTime: post.createdAt?.toISOString(),
    twitterCard: "summary",
  });
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const locale = await getRequestLocale();
  const t = await getTranslations();
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  }).catch(() => null);

  if (!post) notFound();

  return (
    <div className="ep-section py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 ep-fade-up">
        <Link href="/news" className="inline-flex items-center gap-2 text-[var(--ep-text-muted)] hover:text-[var(--ep-accent)] transition-colors duration-300 mb-8 font-semibold text-sm group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          {t.news.backToNews}
        </Link>

        <article>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 uppercase tracking-tight text-[var(--ep-text-primary)] leading-[0.95]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[var(--ep-text-muted)] mb-8 sm:mb-10 border-y border-[var(--ep-border)] py-4 font-medium uppercase tracking-wider text-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--ep-accent-muted)] rounded-lg">
                <User className="w-3.5 h-3.5 text-[var(--ep-accent)]" />
              </div>
              <span className="text-[var(--ep-text-secondary)]">{post.authorName || post.author?.name || t.news.adminAuthor}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--ep-accent-muted)] rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-[var(--ep-accent)]" />
              </div>
              <span>{formatDate(post.createdAt, locale, { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>

          {post.coverImage && (
            <div className="w-full rounded-2xl overflow-hidden mb-8 sm:mb-12 shadow-2xl shadow-black/30 border border-[var(--ep-border)] relative bg-[var(--ep-bg-surface)] group">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ep-bg-deep)] via-transparent to-transparent z-10 bottom-0 top-[60%]" />
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full max-h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none prose-lg md:prose-xl prose-p:leading-relaxed prose-headings:font-[family-name:var(--font-heading)] prose-headings:font-extrabold prose-a:text-[var(--ep-accent)] hover:prose-a:text-[var(--ep-accent-hover)]">
            {post.content.split("\n").map((line, i) => {
              if (line.trim() === "") return <br key={i} />;
              if (line.startsWith("# ")) return <h1 key={i} className="text-3xl md:text-4xl mt-12 mb-6 text-[var(--ep-text-primary)]">{line.replace("# ", "")}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="text-2xl md:text-3xl mt-10 mb-4 text-[var(--ep-text-primary)]">{line.replace("## ", "")}</h2>;
              return <p key={i} className="text-[var(--ep-text-secondary)] mb-6">{line}</p>;
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
