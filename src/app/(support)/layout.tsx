import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Dot } from "lucide-react";
import { getSupportNavigationCategories } from "@/lib/support-data";

export const dynamic = "force-dynamic";

export default async function SupportLayout({ children }: { children: ReactNode }) {
  const categories = await getSupportNavigationCategories();

  return (
    <div className="relative min-h-screen bg-[#f4efe8] text-[#171412]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(244,239,232,0.96)_52%,rgba(236,229,220,1))]" />
      <div className="relative">
        <header className="border-b border-black/8 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href="/support" className="block text-sm font-semibold uppercase tracking-[0.28em] text-[#6f655c]">
                  El Paso Archive
                </Link>
                <p className="mt-1 text-sm text-[#6b635b]">
                  Official support notes, policy updates, and quiet newsroom posts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#171412] transition-colors hover:border-black/15 hover:bg-black/[0.02]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Main Site
                </Link>
              </div>
            </div>

            {categories.length > 0 && (
              <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Support sections">
                <Link
                  href="/support"
                  className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-black/8 bg-[#171412] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                >
                  All posts
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/support/${category.slug}`}
                    className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#171412] transition-colors hover:border-black/15 hover:bg-black/[0.02]"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-black/8">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs uppercase tracking-[0.18em] text-[#7a736b] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>Support portal</span>
            <span className="hidden sm:inline-flex items-center"><Dot className="h-4 w-4" /></span>
            <span>Quiet, official, and mobile-ready</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
