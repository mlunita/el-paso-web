"use client";

import { useActionState } from "react";
import { submitApplication } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";

export function ApplyForm() {
  const [state, formAction, isPending] = useActionState(submitApplication, null);
  const [copied, setCopied] = useState(false);

  if (state?.success) {
    return (
      <div className="bg-emerald-500/5 p-8 rounded-2xl border border-emerald-500/15 text-center animate-in fade-in duration-500 zoom-in-95">
        <div className="relative inline-block mb-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
        </div>
        <h3 className="text-2xl font-black mb-4 uppercase tracking-wider text-emerald-300">Application Submitted</h3>
        <p className="mb-6 text-emerald-200/60 text-sm">Save the following reference code. You will need it to check your status later.</p>
        
        <div 
          onClick={() => {
            navigator.clipboard.writeText(state.refCode!);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="group relative cursor-pointer glass-card p-6 rounded-xl font-mono text-4xl font-black tracking-[0.25em] text-violet-400 border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 inline-block mx-auto hover:shadow-lg hover:shadow-violet-500/10"
        >
          {state.refCode}
          <div className="absolute top-2 right-2 text-zinc-600 group-hover:text-violet-400 transition-colors duration-300">
            {copied ? <span className="text-xs font-sans tracking-normal font-bold text-emerald-400">COPIED</span> : <Copy className="w-4 h-4" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <div className="bg-red-500/5 text-red-400 p-4 rounded-xl border border-red-500/20 font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {state.error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Real Name</Label>
          <Input id="name" name="name" required placeholder="John Doe" className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30 transition-all duration-300" />
        </div>
        <div className="space-y-3">
          <Label htmlFor="username" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">In-game Username</Label>
          <Input id="username" name="username" required placeholder="xX_Slayer_Xx" className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30 transition-all duration-300" />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="email" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Email Address</Label>
        <Input id="email" name="email" type="email" required placeholder="email@example.com" className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30 transition-all duration-300" />
      </div>

      <div className="space-y-3">
        <Label htmlFor="message" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Why do you want to join us?</Label>
        <Textarea id="message" name="message" required rows={5} placeholder="Tell us about yourself..." className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 resize-none focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30 transition-all duration-300" />
      </div>

      <div className="space-y-3">
        <Label htmlFor="links" className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Experience / Links (Optional)</Label>
        <Input id="links" name="links" placeholder="Portfolio, previous clan, youtube..." className="bg-zinc-950/50 border-white/5 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/30 transition-all duration-300" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest py-6 text-sm mt-4 shadow-lg shadow-violet-600/15 hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
        {isPending ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submit Application
          </span>
        )}
      </Button>
    </form>
  );
}
