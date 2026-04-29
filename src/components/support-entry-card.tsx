import Link from "next/link";
import { ArrowUpRight, CalendarDays, Star } from "lucide-react";
import { formatSupportDate, getSupportByline, getSupportExcerpt, getSupportPublishedDate } from "@/lib/support";
import { getLocaleContext } from "@/lib/i18n/server";

type SupportEntryCardProps = {
  entry: {
    title: string;
    slug: string;
    content: string;
    authorName: string | null;
    featured: boolean;
    publishedAt: Date | string | null;
    createdAt: Date | string;
    category: {
      name: string;
      slug: string;
    };
  };
  variant?: "feed" | "compact" | "featured";
  showCategory?: boolean;
};

export async function SupportEntryCard({
  entry,
  variant = "feed",
  showCategory = true,
}: SupportEntryCardProps) {
  const { locale, t } = await getLocaleContext();
  const href = `/support/${entry.category.slug}/${entry.slug}`;
  const byline = getSupportByline(entry, t.support.defaultByline);
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <Link href={href} className="group block h-full">
      <article
        className={[
          "h-full rounded-2xl border border-[var(--ep-border)] bg-[var(--ep-bg-surface)] transition-all duration-200",
          "hover:border-[var(--ep-border-accent)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.3)]",
          isFeatured ? "p-6 sm:p-7" : isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6",
        ].join(" ")}
      >
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ep-text-muted)]">
            {showCategory && <span>{entry.category.name}</span>}
            {entry.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ep-border-accent)] bg-[var(--ep-accent-muted)] px-2.5 py-1 text-[var(--ep-accent)]">
                <Star className="h-3 w-3" />
                {t.common.featured}
              </span>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <h2
              className={[
                "font-[family-name:var(--font-heading)] font-bold tracking-tight text-[var(--ep-text-primary)] transition-colors group-hover:text-[var(--ep-accent)]",
                isFeatured ? "text-2xl sm:text-[1.9rem] leading-tight" : isCompact ? "text-lg leading-7" : "text-xl sm:text-2xl leading-tight",
              ].join(" ")}
            >
              {entry.title}
            </h2>

            <p
              className={[
                "text-[var(--ep-text-secondary)]",
                isCompact ? "text-sm leading-6" : "text-[15px] leading-7",
              ].join(" ")}
            >
              {getSupportExcerpt(entry.content, isFeatured ? 220 : isCompact ? 110 : 170)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ep-border)] pt-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs text-[var(--ep-text-secondary)]">
                <CalendarDays className="h-3.5 w-3.5 text-[var(--ep-accent)]" />
                {formatSupportDate(getSupportPublishedDate(entry), locale)}
              </div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--ep-text-muted)]">
                {byline}
              </div>
            </div>

            <span className="inline-flex min-h-10 items-center gap-1 rounded-full border border-[var(--ep-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ep-text-primary)] transition-colors group-hover:border-[var(--ep-border-accent)] group-hover:text-[var(--ep-accent)]">
              {t.common.read}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
