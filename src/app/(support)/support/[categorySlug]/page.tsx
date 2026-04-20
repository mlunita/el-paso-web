import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { SupportEntryCard } from "@/components/support-entry-card";
import { getSupportCategoryBySlug } from "@/lib/support-data";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getSupportCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Support Section",
    };
  }

  return {
    title: category.name,
    description: category.description || `Published support notes from ${category.name}.`,
    alternates: {
      canonical: `/support/${category.slug}`,
    },
    openGraph: {
      title: category.name,
      description: category.description || `Published support notes from ${category.name}.`,
      url: `/support/${category.slug}`,
      type: "website",
    },
  };
}

export default async function SupportCategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = await getSupportCategoryBySlug(categorySlug);

  if (!category) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <Link
          href="/support"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#171412] transition-colors hover:border-black/15 hover:bg-black/[0.02]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to archive
        </Link>

        <div className="max-w-3xl space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a736b]">Section</div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#171412] sm:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="text-[15px] leading-7 text-[#5f5751] sm:text-base">{category.description}</p>
          )}
        </div>
      </section>

      {category.entries.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white/70 px-6 py-14 text-center text-[#6b635b]">
          This section does not have any public entries yet.
        </div>
      ) : (
        <section className="space-y-4">
          {category.entries.map((entry) => (
            <SupportEntryCard key={entry.id} entry={entry} variant="feed" showCategory={false} />
          ))}
        </section>
      )}
    </div>
  );
}
