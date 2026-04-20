import Link from "next/link";
import { ArrowUpRight, CalendarDays, Star } from "lucide-react";
import { formatSupportDate, getSupportByline, getSupportExcerpt, getSupportPublishedDate } from "@/lib/support";

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

export function SupportEntryCard({
  entry,
  variant = "feed",
  showCategory = true,
}: SupportEntryCardProps) {
  const href = `/support/${entry.category.slug}/${entry.slug}`;
  const byline = getSupportByline(entry);
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <Link href={href} className="group block h-full">
      <article
        className={[
          "h-full rounded-[1.5rem] border border-black/8 bg-white transition-all duration-200",
          "hover:border-black/15 hover:shadow-[0_18px_40px_rgba(15,15,15,0.06)]",
          isFeatured ? "p-6 sm:p-7" : isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6",
        ].join(" ")}
      >
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a736b]">
            {showCategory && <span>{entry.category.name}</span>}
            {entry.featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d8c8b2] bg-[#f6eee3] px-2.5 py-1 text-[#876747]">
                <Star className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <h2
              className={[
                "font-semibold tracking-tight text-[#171412] transition-colors group-hover:text-[#7d5f42]",
                isFeatured ? "text-2xl sm:text-[1.9rem] leading-tight" : isCompact ? "text-lg leading-7" : "text-xl sm:text-2xl leading-tight",
              ].join(" ")}
            >
              {entry.title}
            </h2>

            <p
              className={[
                "text-[#615b55]",
                isCompact ? "text-sm leading-6" : "text-[15px] leading-7",
              ].join(" ")}
            >
              {getSupportExcerpt(entry.content, isFeatured ? 220 : isCompact ? 110 : 170)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs text-[#615b55]">
                <CalendarDays className="h-3.5 w-3.5 text-[#9a7c58]" />
                {formatSupportDate(getSupportPublishedDate(entry))}
              </div>
              <div className="text-xs uppercase tracking-[0.14em] text-[#8b837b]">
                {byline}
              </div>
            </div>

            <span className="inline-flex min-h-10 items-center gap-1 rounded-full border border-black/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#171412] transition-colors group-hover:border-[#d8c8b2] group-hover:text-[#7d5f42]">
              Read
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
