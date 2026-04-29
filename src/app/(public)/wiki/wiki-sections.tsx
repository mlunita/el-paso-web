"use client";

import { useState } from "react";
import { Users, Swords, ShieldCheck, Car, Sparkles, Search, X, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WikiItemImage } from "@/components/wiki-item-image";
import { useI18n } from "@/components/i18n-provider";

const SECTION_CONFIG: Record<string, { icon: any; gradient: string; glow: string }> = {
  GAMEPASS: {
    icon: Sparkles,
    gradient: "from-amber-500/20 to-orange-500/10",
    glow: "bg-amber-500/10",
  },
  WEAPONS: {
    icon: Swords,
    gradient: "from-red-500/20 to-rose-500/10",
    glow: "bg-red-500/10",
  },
  EQUIPMENT: {
    icon: ShieldCheck,
    gradient: "from-blue-500/20 to-cyan-500/10",
    glow: "bg-blue-500/10",
  },
  CARS: {
    icon: Car,
    gradient: "from-emerald-500/20 to-green-500/10",
    glow: "bg-emerald-500/10",
  },
  TEAMS: {
    icon: Users,
    gradient: "from-purple-500/20 to-violet-500/10",
    glow: "bg-purple-500/10",
  },
};

const SECTION_ORDER = ["GAMEPASS", "WEAPONS", "EQUIPMENT", "CARS", "TEAMS"];

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function parseCustomFields(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

interface WikiItem {
  id: string;
  title: string;
  description: string;
  section: string;
  image: string | null;
  order: number;
  tags: string | null;
  customFields: string | null;
}

export function WikiSections({ items }: { items: WikiItem[] }) {
  const { t } = useI18n();
  const [sectionFilters, setSectionFilters] = useState<Record<string, string[]>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SECTION_ORDER.forEach((key, i) => {
      initial[key] = i > 0;
    });
    return initial;
  });
  const [selectedItem, setSelectedItem] = useState<WikiItem | null>(null);

  const grouped: Record<string, WikiItem[]> = {};
  for (const section of SECTION_ORDER) {
    grouped[section] = items.filter((i) => i.section === section);
  }

  const sectionTags: Record<string, string[]> = {};
  for (const section of SECTION_ORDER) {
    const tagSet = new Set<string>();
    grouped[section].forEach((item) => {
      parseTags(item.tags).forEach((t) => tagSet.add(t));
    });
    sectionTags[section] = Array.from(tagSet).sort();
  }

  const toggleFilter = (section: string, tag: string) => {
    setSectionFilters((prev) => {
      const current = prev[section] || [];
      if (current.includes(tag)) {
        return { ...prev, [section]: current.filter((t) => t !== tag) };
      }
      return { ...prev, [section]: [...current, tag] };
    });
  };

  const clearFilters = (section: string) => {
    setSectionFilters((prev) => ({ ...prev, [section]: [] }));
  };

  const toggleCollapse = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getFilteredItems = (section: string) => {
    const activeFilters = sectionFilters[section] || [];
    if (activeFilters.length === 0) return grouped[section];
    return grouped[section].filter((item) => {
      const itemTags = parseTags(item.tags);
      return activeFilters.every((f) => itemTags.includes(f));
    });
  };

  const selectedTags = selectedItem ? parseTags(selectedItem.tags) : [];
  const selectedCustomFields = selectedItem ? parseCustomFields(selectedItem.customFields) : {};

  return (
    <>
      {SECTION_ORDER.map((sectionKey, sIndex) => {
        const config = SECTION_CONFIG[sectionKey];
        const Icon = config.icon;
        const tags = sectionTags[sectionKey];
        const activeFilters = sectionFilters[sectionKey] || [];
        const filteredItems = getFilteredItems(sectionKey);
        const isCollapsed = collapsedSections[sectionKey] ?? false;
        const itemCount = grouped[sectionKey].length;

        return (
          <section
            key={sectionKey}
            className="ep-fade-up mb-6"
            style={{ animationDelay: `${sIndex * 80}ms` }}
          >
            {/* Section Header */}
            <button
              onClick={() => toggleCollapse(sectionKey)}
              className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
            >
              <div className={`p-2 rounded-xl ${config.glow} border border-[var(--ep-border)] transition-colors duration-200 group-hover:border-[var(--ep-border-accent)]`}>
                <Icon className="w-5 h-5 text-[var(--ep-text-secondary)]" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-[var(--ep-text-primary)]">
                {t.wiki.sections[sectionKey as keyof typeof t.wiki.sections]}
              </h2>
              <span className="text-xs font-bold text-[var(--ep-text-muted)] tabular-nums">
                ({itemCount})
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--ep-border)] to-transparent" />
              <ChevronDown
                className={`w-5 h-5 text-[var(--ep-text-muted)] group-hover:text-[var(--ep-text-secondary)] transition-all duration-300 ${
                  isCollapsed ? "" : "rotate-180"
                }`}
              />
            </button>

            {/* Collapsible Content */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
              }`}
            >
              {/* Tag filter chips */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <Search className="w-3.5 h-3.5 text-[var(--ep-text-muted)]" />
                  {tags.map((tag) => {
                    const isActive = activeFilters.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleFilter(sectionKey, tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                          isActive
                            ? "bg-[var(--ep-accent-muted)] text-[var(--ep-accent)] border-[var(--ep-border-accent)]"
                            : "bg-[var(--ep-bg-elevated)] text-[var(--ep-text-muted)] border-[var(--ep-border)] hover:bg-[var(--ep-bg-hover)] hover:text-[var(--ep-text-secondary)]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                  {activeFilters.length > 0 && (
                    <button
                      onClick={() => clearFilters(sectionKey)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-[var(--ep-danger)]/70 hover:text-[var(--ep-danger)] transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      {t.wiki.clearFilters}
                    </button>
                  )}
                </div>
              )}

              {/* Items grid */}
              {filteredItems.length === 0 ? (
                <div className="ep-card border-dashed rounded-2xl p-8 text-center mb-2">
                  <span className="text-[var(--ep-text-muted)] font-medium">
                    {activeFilters.length > 0 ? t.wiki.noMatches : t.wiki.noItems}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                  {filteredItems.map((item, index) => {
                    const itemTags = parseTags(item.tags);
                    const itemCustomFields = parseCustomFields(item.customFields);

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group ep-card rounded-2xl overflow-hidden flex flex-col text-left cursor-pointer ep-fade-up"
                        style={{ animationDelay: `${(sIndex * 80) + (index * 50)}ms` }}
                      >
                        <div className="w-full h-40 relative overflow-hidden bg-[var(--ep-bg-surface)] border-b border-[var(--ep-border)] shrink-0">
                          <WikiItemImage
                            src={item.image}
                            alt={item.title}
                            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            fallbackClassName="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--ep-bg-deep)] via-[var(--ep-bg-surface)] to-[var(--ep-bg-deep)]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--ep-bg-surface)] to-transparent" />
                          </WikiItemImage>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-[family-name:var(--font-heading)] text-base font-bold text-[var(--ep-text-primary)] group-hover:text-[var(--ep-accent)] transition-colors duration-300 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-[var(--ep-text-secondary)] text-sm leading-relaxed flex-1 line-clamp-3">
                            {item.description}
                          </p>
                          {itemTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {itemTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-full bg-[var(--ep-accent-muted)] text-[var(--ep-accent)] text-[10px] font-semibold uppercase tracking-wider border border-[var(--ep-border-accent)]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {Object.keys(itemCustomFields).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(itemCustomFields).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="text-[10px] text-[var(--ep-text-muted)] font-medium"
                                >
                                  {t.wiki.customFields[key as keyof typeof t.wiki.customFields] || key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[var(--ep-accent)]/40 group-hover:text-[var(--ep-accent)]/70 transition-colors duration-300">
                            {t.wiki.clickToRead}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Article Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-2xl bg-[var(--ep-bg-elevated)] border-[var(--ep-border)] text-[var(--ep-text-primary)] max-h-[85vh] overflow-y-auto">
          {selectedItem && (
            <>
              <div className="w-full h-56 sm:h-64 relative overflow-hidden rounded-xl -mt-1 mb-2">
                <WikiItemImage
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  variant="modal"
                  imgClassName="w-full h-full object-cover"
                  fallbackClassName="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ep-bg-deep)] via-[var(--ep-bg-surface)] to-[var(--ep-bg-deep)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ep-bg-elevated)] via-transparent to-transparent" />
                </WikiItemImage>
              </div>
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-[var(--ep-text-primary)] tracking-tight">
                  {selectedItem.title}
                </DialogTitle>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-[var(--ep-accent-muted)] text-[var(--ep-accent)] text-xs font-semibold border border-[var(--ep-border-accent)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </DialogHeader>
              <DialogDescription className="text-[var(--ep-text-secondary)] text-sm leading-relaxed whitespace-pre-wrap mt-2">
                {selectedItem.description}
              </DialogDescription>
              {Object.keys(selectedCustomFields).length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-[var(--ep-bg-surface)] border border-[var(--ep-border)]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--ep-text-muted)] mb-2">
                    {t.wiki.details}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(selectedCustomFields).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--ep-text-muted)] font-medium">{t.wiki.customFields[key as keyof typeof t.wiki.customFields] || key}:</span>
                        <span className="text-[var(--ep-text-secondary)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
