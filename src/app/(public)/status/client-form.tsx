"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function CheckStatusForm({ defaultValue }: { defaultValue?: string }) {
  const [refCode, setRefCode] = useState(defaultValue || "");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode.trim()) return;
    router.push(`/status?refCode=${refCode.trim()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex relative items-center group/form">
      <div className="absolute inset-0 rounded-2xl bg-[#a67c52]/5 blur-xl opacity-0 group-hover/form:opacity-100 transition-opacity duration-500" />
      <Input
        value={refCode}
        onChange={(e) => setRefCode(e.target.value)}
        placeholder="Enter Reference Code"
        className="relative bg-zinc-950/60 border-white/5 text-white placeholder:text-zinc-700 w-full pl-6 pr-32 py-8 text-lg md:text-2xl font-mono rounded-2xl uppercase tracking-[0.2em] focus-visible:ring-[#a67c52]/50 focus-visible:border-[#a67c52]/30 shadow-2xl shadow-black/20 transition-all duration-300"
      />
      <Button 
        type="submit" 
        className="absolute right-3 bg-gradient-to-r from-[#a67c52] to-[#7ca982] hover:from-[#b8895e] hover:to-[#8fba96] text-white h-[calc(100%-1.5rem)] px-6 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-[#a67c52]/15 hover:shadow-[#a67c52]/25 transition-all duration-300"
      >
        <Search className="w-5 h-5 mr-2 hidden md:block" />
        Track
      </Button>
    </form>
  );
}
