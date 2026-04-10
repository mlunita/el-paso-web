"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/admin");
      router.refresh();
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
        <Label htmlFor="email" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="admin@eprp.gg"
          className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-[#a67c52]/50 focus-visible:border-[#a67c52]/30 transition-all duration-300"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          placeholder="••••••••"
          className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-[#a67c52]/50 focus-visible:border-[#a67c52]/30 transition-all duration-300"
        />
      </div>
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#a67c52] to-[#7ca982] hover:from-[#b8895e] hover:to-[#8fba96] text-white py-6 text-sm font-black uppercase tracking-widest shadow-lg shadow-[#a67c52]/15 hover:shadow-[#a67c52]/25 transition-all duration-300 hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing In...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </span>
        )}
      </Button>
    </form>
  );
}
