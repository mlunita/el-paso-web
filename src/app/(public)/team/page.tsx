import type { Metadata } from "next";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TeamSections } from "./team-sections";
import { SectionHeading } from "@/components/section-heading";
import { getRequestLocale, getTranslations } from "@/lib/i18n/server";
import { createLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations();

  return createLocalizedMetadata({
    locale,
    path: "/team",
    title: t.seo.pages.team.title,
    description: t.seo.pages.team.description,
    twitterCard: "summary",
  });
}

export default async function OurTeamPage() {
  const t = await getTranslations();
  const staff = await prisma.staffMember.findMany({
    orderBy: { order: "asc" },
  }).catch(() => []);

  return (
    <div className="ep-section py-8 sm:py-12">
      <div className="ep-section-inner">
        <SectionHeading title={t.team.heading} subtitle={t.team.subtitle} icon={Users} align="center" />
        <TeamSections staff={staff} />
      </div>
    </div>
  );
}
