"use client";

import { useActionState } from "react";
import { submitApplication } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";

export function ApplyForm() {
  const [state, formAction, isPending] = useActionState(submitApplication, null);
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  if (state?.success) {
    return (
      <div className="bg-[var(--ep-success)]/5 p-8 rounded-xl border border-[var(--ep-success)]/15 text-center animate-in fade-in duration-500 zoom-in-95">
        <div className="relative inline-block mb-4">
          <CheckCircle2 className="w-14 h-14 text-[var(--ep-success)]" />
          <div className="absolute inset-0 bg-[var(--ep-success)]/20 blur-2xl rounded-full" />
        </div>
        <h3 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold mb-4 uppercase tracking-wider text-[var(--ep-success)]">{t.apply.success.heading}</h3>
        <p className="mb-6 text-[var(--ep-success)]/60 text-sm">{t.apply.success.desc}</p>
        
        <div 
          onClick={() => {
            navigator.clipboard.writeText(state.refCode!);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="group relative cursor-pointer ep-card-elevated p-6 rounded-xl font-[family-name:var(--font-mono)] text-4xl font-bold tracking-[0.25em] text-[var(--ep-accent)] border-[var(--ep-border-accent)] hover:border-[var(--ep-accent)]/40 transition-all duration-300 inline-block mx-auto hover:shadow-lg hover:shadow-[var(--ep-accent-glow)]"
        >
          {state.refCode}
          <div className="absolute top-2 right-2 text-[var(--ep-text-muted)] group-hover:text-[var(--ep-accent)] transition-colors duration-300">
            {copied ? <span className="text-xs font-sans tracking-normal font-bold text-[var(--ep-success)]">{t.apply.success.copied}</span> : <Copy className="w-4 h-4" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <div className="bg-[var(--ep-danger)]/5 text-[var(--ep-danger)] p-4 rounded-xl border border-[var(--ep-danger)]/20 font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <div className="w-2 h-2 bg-[var(--ep-danger)] rounded-full animate-pulse" />
          {state.error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="discord" className="text-[var(--ep-text-muted)] uppercase tracking-widest text-xs font-bold">{t.apply.form.discord}</Label>
          <Input id="discord" name="discord" required placeholder={t.apply.form.discordPlaceholder} className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-[var(--ep-text-primary)] placeholder:text-[var(--ep-text-muted)] h-12 transition-all duration-300" />
        </div>
        <div className="space-y-3">
          <Label htmlFor="roblox" className="text-[var(--ep-text-muted)] uppercase tracking-widest text-xs font-bold">{t.apply.form.roblox}</Label>
          <Input id="roblox" name="roblox" required placeholder={t.apply.form.robloxPlaceholder} className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-[var(--ep-text-primary)] placeholder:text-[var(--ep-text-muted)] h-12 transition-all duration-300" />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="message" className="text-[var(--ep-text-muted)] uppercase tracking-widest text-xs font-bold">{t.apply.form.message}</Label>
        <Textarea id="message" name="message" required rows={5} placeholder={t.apply.form.messagePlaceholder} className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-[var(--ep-text-primary)] placeholder:text-[var(--ep-text-muted)] resize-none transition-all duration-300" />
      </div>

      <div className="space-y-3">
        <Label htmlFor="links" className="text-[var(--ep-text-muted)] uppercase tracking-widest text-xs font-bold">{t.apply.form.links}</Label>
        <Input id="links" name="links" placeholder={t.apply.form.linksPlaceholder} className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-[var(--ep-text-primary)] placeholder:text-[var(--ep-text-muted)] h-12 transition-all duration-300" />
      </div>

      <Button type="submit" disabled={isPending} className="w-full bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)] text-[var(--ep-bg-deep)] font-extrabold uppercase tracking-widest py-6 text-sm mt-4 shadow-lg shadow-[var(--ep-accent-glow)] hover:shadow-xl hover:shadow-[var(--ep-accent-glow)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 rounded-xl">
        {isPending ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[var(--ep-bg-deep)]/30 border-t-[var(--ep-bg-deep)] rounded-full animate-spin" />
            {t.apply.form.submitting}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {t.apply.form.submit}
          </span>
        )}
      </Button>
    </form>
  );
}
