"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { authenticateModerator } from "./actions";

export function ModLoginForm() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authenticateModerator(token);
      if (result.success) {
        router.push("/mod");
        router.refresh();
      } else {
        setError(result.error || "Invalid or revoked token");
      }
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8">
      {error && (
        <div className="bg-red-500/5 text-red-400 p-3 rounded-xl border border-red-500/15 flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="token" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">
          Access Token
        </Label>
        <Input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="Paste your moderator token..."
          className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-[#7ca982]/50 focus-visible:border-[#7ca982]/30 transition-all duration-300"
        />
        <p className="text-xs text-zinc-600 mt-1">
          Your token was provided by an administrator
        </p>
      </div>
      <Button
        type="submit"
        disabled={loading || !token.trim()}
        className="w-full bg-gradient-to-r from-[#7ca982] to-[#50a080] hover:from-[#8fba96] hover:to-[#5db58e] text-white py-6 text-sm font-black uppercase tracking-widest shadow-lg shadow-[#7ca982]/15 hover:shadow-[#7ca982]/25 transition-all duration-300 hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Authenticating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Access Mod Panel
          </span>
        )}
      </Button>
    </form>
  );
}
