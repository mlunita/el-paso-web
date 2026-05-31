import { getTranslations } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SpecialRequestFormClient } from "./form-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SpecialRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations();
  const { id } = await params;

  const form = await prisma.specialRequestForm.findUnique({
    where: { id },
  });

  if (!form || !form.isActive) return notFound();

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 relative flex justify-center mt-12 sm:mt-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--ep-accent)]/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10">
        <Link href="/special-requests" className="inline-flex items-center text-[var(--ep-text-muted)] hover:text-white transition-colors mb-8 text-sm font-bold group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t.specialRequests.backToHome}
        </Link>

        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] font-bold text-white mb-3 drop-shadow-md">
            {form.title}
          </h1>
          <p className="text-[var(--ep-text-muted)] text-sm sm:text-base leading-relaxed">
            {form.description || t.specialRequests.formSubtitle}
          </p>
        </div>

        <SpecialRequestFormClient form={form} />
      </div>
    </div>
  );
}
