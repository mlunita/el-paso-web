export const SUPPORT_CATEGORY_VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Visible" },
  { value: "HIDDEN", label: "Hidden" },
] as const;

export const SUPPORT_ENTRY_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
] as const;

export const SUPPORT_ENTRY_VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Listed publicly" },
  { value: "UNLISTED", label: "Unlisted" },
  { value: "HIDDEN", label: "Hidden" },
] as const;

export function slugifySupportValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getSupportExcerpt(content: string, maxLength = 180) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function getSupportPublishedDate(entry: { publishedAt?: Date | string | null; createdAt: Date | string }) {
  return entry.publishedAt || entry.createdAt;
}

export function getSupportByline(entry: { authorName?: string | null }, fallback = "El Paso RP Team") {
  return entry.authorName?.trim() || fallback;
}

export function formatSupportDate(value: Date | string, locale = "en") {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
