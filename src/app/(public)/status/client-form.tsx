"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function CheckStatusForm({ defaultValue }: { defaultValue?: string }) {
  const [refCode, setRefCode] = useState(defaultValue || "");
  const router = useRouter();
  const { t } = useI18n();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode.trim()) return;
    router.push(`/status?refCode=${refCode.trim()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex relative items-center group/form">
      <div className="absolute inset-0 rounded-xl bg-[var(--ep-accent)]/5 blur-xl opacity-0 group-hover/form:opacity-100 transition-opacity duration-500" />
      <Input
        value={refCode}
        onChange={(e) => setRefCode(e.target.value)}
        placeholder={t.applicationStatus.placeholder}
        className="relative bg-[var(--ep-bg-surface)] border-[var(--ep-border)] text-[var(--ep-text-primary)] placeholder:text-[var(--ep-text-muted)] w-full pl-6 pr-32 py-8 text-lg md:text-2xl font-[family-name:var(--font-mono)] rounded-xl uppercase tracking-[0.2em] shadow-2xl shadow-black/20 transition-all duration-300"
      />
      <Button 
        type="submit" 
        className="absolute right-3 bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)] text-[var(--ep-bg-deep)] h-[calc(100%-1.5rem)] px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-[var(--ep-accent-glow)] hover:shadow-[var(--ep-accent-glow)] transition-all duration-300"
      >
        <Search className="w-5 h-5 mr-2 hidden md:block" />
        {t.applicationStatus.track}
      </Button>
    </form>
  );
}
