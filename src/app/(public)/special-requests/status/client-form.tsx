"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";

export function CheckSpecialStatusForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ref, setRef] = useState(searchParams.get("ref") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    router.push(`/special-requests/status?ref=${encodeURIComponent(ref.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto w-full relative z-10">
      <Input 
        type="text" 
        placeholder="e.g. ABC123XY" 
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        className="h-14 sm:h-16 bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white text-lg font-mono tracking-widest px-6 shadow-inner focus:ring-[var(--ep-accent)]"
      />
      <Button 
        type="submit" 
        className="h-14 sm:h-16 px-6 sm:px-10 bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)] text-black font-extrabold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105"
      >
        <Search className="w-5 h-5 sm:w-6 sm:h-6 sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
