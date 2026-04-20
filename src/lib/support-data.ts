import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const supportPublicEntryInclude = {
  category: true,
} satisfies Prisma.SupportEntryInclude;

export type SupportPublicEntry = Prisma.SupportEntryGetPayload<{
  include: typeof supportPublicEntryInclude;
}>;

export type SupportNavigationCategory = {
  id: string;
  name: string;
  slug: string;
};

export type SupportHomeCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  latestEntry: SupportPublicEntry | null;
};

function getSupportPublishWindowWhere(now = new Date()): Prisma.SupportEntryWhereInput {
  return {
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
  };
}

function getSupportCategoryPublicEntryWhere(now = new Date()): Prisma.SupportEntryWhereInput {
  return {
    status: "PUBLISHED",
    visibility: "PUBLIC",
    ...getSupportPublishWindowWhere(now),
  };
}

function getSupportPublicEntryWhere(now = new Date()): Prisma.SupportEntryWhereInput {
  return {
    status: "PUBLISHED",
    visibility: "PUBLIC",
    category: { visibility: "PUBLIC" },
    ...getSupportPublishWindowWhere(now),
  };
}

function getSupportReadableEntryWhere(now = new Date()): Prisma.SupportEntryWhereInput {
  return {
    status: "PUBLISHED",
    visibility: { in: ["PUBLIC", "UNLISTED"] },
    ...getSupportPublishWindowWhere(now),
  };
}

const publicEntryOrder: Prisma.SupportEntryOrderByWithRelationInput[] = [
  { publishedAt: "desc" },
  { createdAt: "desc" },
  { order: "asc" },
];

const featuredEntryOrder: Prisma.SupportEntryOrderByWithRelationInput[] = [
  { order: "asc" },
  { publishedAt: "desc" },
  { createdAt: "desc" },
];

export async function getSupportNavigationCategories(): Promise<SupportNavigationCategory[]> {
  const now = new Date();

  return prisma.supportCategory.findMany({
    where: {
      visibility: "PUBLIC",
      entries: {
        some: getSupportCategoryPublicEntryWhere(now),
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export async function getSupportHomeData(): Promise<{
  latestEntries: SupportPublicEntry[];
  featuredEntries: SupportPublicEntry[];
  categories: SupportHomeCategory[];
}> {
  const now = new Date();
  const categoryEntryWhere = getSupportCategoryPublicEntryWhere(now);

  const [latestEntries, featuredEntries, categoryResults] = await Promise.all([
    prisma.supportEntry.findMany({
      where: getSupportPublicEntryWhere(now),
      include: supportPublicEntryInclude,
      orderBy: publicEntryOrder,
    }),
    prisma.supportEntry.findMany({
      where: {
        ...getSupportPublicEntryWhere(now),
        featured: true,
      },
      include: supportPublicEntryInclude,
      orderBy: featuredEntryOrder,
      take: 2,
    }),
    prisma.supportCategory.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        entries: {
          where: categoryEntryWhere,
          include: supportPublicEntryInclude,
          orderBy: publicEntryOrder,
          take: 1,
        },
      },
    }),
  ]);

  const categories = categoryResults.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    order: category.order,
    latestEntry: category.entries[0] ?? null,
  }));

  return {
    latestEntries,
    featuredEntries,
    categories,
  };
}

export async function getSupportCategoryBySlug(slug: string) {
  const now = new Date();

  return prisma.supportCategory.findFirst({
    where: {
      slug,
      visibility: "PUBLIC",
    },
    include: {
      entries: {
        where: getSupportCategoryPublicEntryWhere(now),
        include: supportPublicEntryInclude,
        orderBy: publicEntryOrder,
      },
    },
  });
}

export async function getSupportEntryBySlugs(categorySlug: string, entrySlug: string): Promise<SupportPublicEntry | null> {
  const now = new Date();

  return prisma.supportEntry.findFirst({
    where: {
      slug: entrySlug,
      ...getSupportReadableEntryWhere(now),
      category: {
        slug: categorySlug,
        visibility: "PUBLIC",
      },
    },
    include: supportPublicEntryInclude,
  });
}

export async function getRelatedSupportEntries(categoryId: string, currentEntryId: string): Promise<SupportPublicEntry[]> {
  const now = new Date();

  return prisma.supportEntry.findMany({
    where: {
      id: { not: currentEntryId },
      categoryId,
      ...getSupportPublicEntryWhere(now),
    },
    include: supportPublicEntryInclude,
    orderBy: publicEntryOrder,
    take: 3,
  });
}
