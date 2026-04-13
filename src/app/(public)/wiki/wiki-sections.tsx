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

const SECTION_CONFIG: Record<string, { label: string; icon: any; gradient: string; glow: string }> = {
  GAMEPASS: {
    label: "Gamepass",
    icon: Sparkles,
    gradient: "from-amber-500/20 to-orange-500/10",
    glow: "bg-amber-500/10",
  },
  WEAPONS: {
    label: "Weapons",
    icon: Swords,
    gradient: "from-red-500/20 to-rose-500/10",
    glow: "bg-red-500/10",
  },
  EQUIPMENT: {
    label: "Equipment",
    icon: ShieldCheck,
    gradient: "from-blue-500/20 to-cyan-500/10",
    glow: "bg-blue-500/10",
  },
  CARS: {
    label: "Cars",
    icon: Car,
    gradient: "from-emerald-500/20 to-green-500/10",
    glow: "bg-emerald-500/10",
  },
  TEAMS: {
    label: "Teams",
    icon: Users,
    gradient: "from-purple-500/20 to-violet-500/10",
    glow: "bg-purple-500/10",
  },
};

const SECTION_ORDER = ["GAMEPASS", "WEAPONS", "EQUIPMENT", "CARS", "TEAMS"];

// Custom field display labels
const CUSTOM_FIELD_LABELS: Record<string, string> = {
  mileage: "Mileage",
};

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
  // Per-section active tag filters
  const [sectionFilters, setSectionFilters] = useState<Record<string, string[]>>({});
  // Per-section collapsed state — first section open by default
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SECTION_ORDER.forEach((key, i) => {
      initial[key] = i > 0; // First section expanded, rest collapsed
    });
    return initial;
  });
  // Modal state
  const [selectedItem, setSelectedItem] = useState<WikiItem | null>(null);

  const grouped: Record<string, WikiItem[]> = {};
  for (const section of SECTION_ORDER) {
    grouped[section] = items.filter((i) => i.section === section);
  }

  // Compute unique tags per section
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
            className="animate-fade-in-up"
            style={{ animationDelay: `${sIndex * 100}ms` }}
          >
            {/* Collapsible Section Header */}
            <button
              onClick={() => toggleCollapse(sectionKey)}
              className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
            >
              <div className={`p-2 rounded-xl ${config.glow} border border-white/5 transition-colors duration-200 group-hover:border-white/10`}>
                <Icon className="w-5 h-5 text-zinc-300" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-white">
                {config.label}
              </h2>
              <span className="text-xs font-bold text-zinc-600 tabular-nums">
                ({itemCount})
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-all duration-300 ${
                  isCollapsed ? "" : "rotate-180"
                }`}
              />
            </button>

            {/* Collapsible Content */}
            <div
              className={`overflow-hidden transition-all duration-400 ease-in-out ${
                isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
              }`}
            >
              {/* Tag filter chips */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <Search className="w-3.5 h-3.5 text-zinc-500" />
                  {tags.map((tag) => {
                    const isActive = activeFilters.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleFilter(sectionKey, tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                          isActive
                            ? "bg-[#a67c52]/25 text-[#c9a87c] border-[#a67c52]/30 shadow-sm shadow-[#a67c52]/10"
                            : "bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-300"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                  {activeFilters.length > 0 && (
                    <button
                      onClick={() => clearFilters(sectionKey)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Items grid */}
              {filteredItems.length === 0 ? (
                <div className="glass-card border-dashed rounded-2xl p-8 text-center mb-2">
                  <span className="text-zinc-600 font-medium">
                    {activeFilters.length > 0
                      ? "No items match the selected filters."
                      : "No items in this section yet."}
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
                        className="group glass-card rounded-2xl overflow-hidden hover:border-[#a67c52]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#a67c52]/5 animate-fade-in-up flex flex-col text-left cursor-pointer"
                        style={{ animationDelay: `${(sIndex * 100) + (index * 60)}ms` }}
                      >
                        <div className="w-full h-40 relative overflow-hidden bg-zinc-900 border-b border-white/5 shrink-0">
                          <WikiItemImage
                            src={item.image}
                            alt={item.title}
                            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            fallbackClassName="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                          </WikiItemImage>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-300 mb-2">
                            {item.title}
                          </h3>
                          {/* Truncated description — max 3 lines */}
                          <p className="text-zinc-500 text-sm leading-relaxed flex-1 line-clamp-3">
                            {item.description}
                          </p>
                          {/* Tags */}
                          {itemTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {itemTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-md bg-[#a67c52]/10 text-[#c9a87c]/80 text-[10px] font-semibold uppercase tracking-wider border border-[#a67c52]/10"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Custom fields preview */}
                          {Object.keys(itemCustomFields).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(itemCustomFields).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="text-[10px] text-zinc-500 font-medium"
                                >
                                  {CUSTOM_FIELD_LABELS[key] || key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* "Read more" hint */}
                          <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#a67c52]/40 group-hover:text-[#a67c52]/70 transition-colors duration-300">
                            Click to read more →
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
        <DialogContent className="sm:max-w-2xl bg-zinc-950 border-white/10 text-white max-h-[85vh] overflow-y-auto">
          {selectedItem && (
            <>
              <div className="w-full h-56 sm:h-64 relative overflow-hidden rounded-lg -mt-1 mb-2">
                <WikiItemImage
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  variant="modal"
                  imgClassName="w-full h-full object-cover"
                  fallbackClassName="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                </WikiItemImage>
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white tracking-tight">
                  {selectedItem.title}
                </DialogTitle>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-lg bg-[#a67c52]/15 text-[#c9a87c] text-xs font-semibold border border-[#a67c52]/15"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </DialogHeader>
              <DialogDescription className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap mt-2">
                {selectedItem.description}
              </DialogDescription>
              {Object.keys(selectedCustomFields).length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
                    Details
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(selectedCustomFields).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 font-medium">{CUSTOM_FIELD_LABELS[key] || key}:</span>
                        <span className="text-zinc-300">{value}</span>
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
