import type { Metadata } from "next";
import {
  getAlternateLanguages,
  getDictionary,
  getLocalizedPath,
  type Locale,
  type Strings,
} from "@/lib/i18n";

type LocalizedMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  robots?: Metadata["robots"];
  twitterCard?: "summary" | "summary_large_image";
};

export function createLocalizedMetadata({
  locale,
  path,
  title,
  description,
  image = "/logo.png",
  imageAlt,
  type = "website",
  publishedTime,
  authors,
  robots,
  twitterCard = "summary_large_image",
}: LocalizedMetadataInput): Metadata {
  const t = getDictionary(locale);
  const localizedPath = getLocalizedPath(path, locale);
  const languages = getAlternateLanguages(path);

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath,
      languages,
    },
    robots,
    openGraph: {
      title,
      description,
      url: localizedPath,
      type,
      locale: t.locale.ogLocale,
      alternateLocale: locale === "en" ? ["es_MX"] : ["en_US"],
      siteName: t.site.fullName,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt || t.seo.imageAlt }],
      publishedTime,
      authors,
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: twitterCard === "summary_large_image" ? [image] : undefined,
    },
  };
}

export function createRootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://elpaso.vercel.app"),
    title: {
      default: t.seo.defaultTitle,
      template: t.seo.titleTemplate,
    },
    description: t.seo.defaultDescription,
    keywords: t.seo.keywords,
    authors: [{ name: t.seo.author }],
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: {
      canonical: getLocalizedPath("/", locale),
      languages: getAlternateLanguages("/"),
    },
    openGraph: {
      type: "website",
      locale: t.locale.ogLocale,
      alternateLocale: locale === "en" ? ["es_MX"] : ["en_US"],
      url: getLocalizedPath("/", locale),
      siteName: t.site.fullName,
      title: t.seo.defaultTitle,
      description: t.seo.ogDescription,
      images: [{ url: "/logo.png", width: 1200, height: 630, alt: t.seo.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.site.fullName,
      description: t.seo.twitterDescription,
      images: ["/logo.png"],
    },
    verification: {
      google: "0SV78R7CjIyoIBVVT0NgswOrnSR_gFgdFoudAUIj92Y",
    },
  };
}

export function getPageSeo(t: Strings, page: keyof Strings["seo"]["pages"]) {
  return t.seo.pages[page];
}
