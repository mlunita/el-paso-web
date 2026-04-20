import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SupportEntryCard } from "@/components/support-entry-card";
import { getSupportHomeData } from "@/lib/support-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support Archive",
  description: "Browse official support notes, policies, and published updates for El Paso RP.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Support Archive",
    description: "Browse official support notes, policies, and published updates for El Paso RP.",
    url: "/support",
    type: "website",
  },
};

export default async function SupportPage() {
  const { latestEntries, featuredEntries, categories } = await getSupportHomeData();

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="space-y-5">
          <div className="max-w-2xl space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7a736b]">
              Support and updates
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#171412] sm:text-4xl">
              A quieter archive for official notes.
            </h1>
            <p className="text-[15px] leading-7 text-[#5f5751] sm:text-base">
              Published answers, newsroom updates, and operational guidance live here in a calmer, more focused space than the main site.
            </p>
          </div>

          {latestEntries.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white/70 px-6 py-14 text-center text-[#6b635b]">
              No public entries have been published yet.
            </div>
          ) : (
            <div className="space-y-4">
              {latestEntries.map((entry) => (
                <SupportEntryCard key={entry.id} entry={entry} variant="feed" />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          {featuredEntries.length > 0 && (
            <section className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a736b]">
                Featured
              </div>
              <div className="space-y-3">
                {featuredEntries.map((entry) => (
                  <SupportEntryCard key={entry.id} entry={entry} variant="featured" />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[1.5rem] border border-black/8 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#171412]">Sections</h2>
                <p className="mt-1 text-sm leading-6 text-[#6b635b]">Browse the archive by topic.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/support/${category.slug}`}
                  className="group flex min-h-12 items-start justify-between gap-4 rounded-2xl border border-black/8 px-4 py-3 transition-colors hover:border-black/15 hover:bg-black/[0.02]"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#171412]">{category.name}</div>
                    <div className="mt-1 text-sm leading-6 text-[#6b635b]">
                      {category.description || category.latestEntry?.title || "Published notes are available in this section."}
                    </div>
                  </div>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#7a736b] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
