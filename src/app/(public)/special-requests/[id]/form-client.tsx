"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitSpecialRequest } from "../actions";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";

export function SpecialRequestFormClient({ form }: { form: any }) {
  const { t } = useI18n();
  const [discord, setDiscord] = useState("");
  const [roblox, setRoblox] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [successCode, setSuccessCode] = useState("");

  const fields = JSON.parse(form.fields);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discord.trim() || !roblox.trim()) {
      setError("Discord and Roblox usernames are required.");
      return;
    }

    for (const field of fields) {
      if (field.required && !responses[field.id]?.trim()) {
        setError(`Field "${field.label}" is required.`);
        return;
      }
    }

    startTransition(async () => {
      setError("");
      const res = await submitSpecialRequest(form.id, discord, roblox, responses);
      if (res.success && res.refCode) {
        setSuccessCode(res.refCode);
      } else {
        setError(res.error || "Failed to submit request.");
      }
    });
  };

  if (successCode) {
    return (
      <div className="ep-card-glass p-8 sm:p-12 text-center rounded-2xl border-[var(--ep-border)] max-w-2xl mx-auto mt-12 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-white mb-2">
          {t.specialRequests.successTitle}
        </h2>
        <p className="text-[var(--ep-text-muted)] text-lg mb-8">
          {t.specialRequests.successDesc}
        </p>
        
        <div className="bg-[var(--ep-bg-deep)] border border-[var(--ep-border)] rounded-xl p-6 mb-8 inline-block shadow-inner">
          <span className="font-mono text-3xl sm:text-4xl font-black text-[var(--ep-accent)] tracking-[0.2em]">{successCode}</span>
        </div>

        <p className="text-sm text-[var(--ep-text-secondary)] mb-8 max-w-md mx-auto">
          {t.specialRequests.trackInfo} <Link href="/special-requests/status" className="text-white font-bold underline underline-offset-4 decoration-[var(--ep-accent)] hover:text-[var(--ep-accent)] transition-colors">/special-requests/status</Link>
        </p>

        <Link href="/">
          <Button className="bg-[var(--ep-bg-hover)] text-white border border-[var(--ep-border)] hover:bg-[var(--ep-border)]">
            {t.specialRequests.backToHome}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="ep-card-glass p-6 sm:p-8 rounded-2xl border-[var(--ep-border)] space-y-6">
        <h3 className="text-xl font-bold text-white border-b border-[var(--ep-border)] pb-4 mb-6">User Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--ep-text-muted)] uppercase tracking-wider">
              {t.specialRequests.discordLabel} <span className="text-red-400">*</span>
            </label>
            <Input 
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder={t.specialRequests.discordPlaceholder}
              className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--ep-text-muted)] uppercase tracking-wider">
              {t.specialRequests.robloxLabel} <span className="text-red-400">*</span>
            </label>
            <Input 
              value={roblox}
              onChange={(e) => setRoblox(e.target.value)}
              placeholder={t.specialRequests.robloxPlaceholder}
              className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white h-12"
            />
          </div>
        </div>
      </div>

      <div className="ep-card-glass p-6 sm:p-8 rounded-2xl border-[var(--ep-border)] space-y-6">
        <h3 className="text-xl font-bold text-white border-b border-[var(--ep-border)] pb-4 mb-6">Request Details</h3>
        <div className="space-y-6">
          {fields.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs font-bold text-[var(--ep-text-muted)] uppercase tracking-wider">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              
              {field.type === "text" && (
                <Input 
                  value={responses[field.id] || ""}
                  onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                  className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white h-12"
                />
              )}

              {field.type === "textarea" && (
                <Textarea 
                  value={responses[field.id] || ""}
                  onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                  className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-white min-h-[120px]"
                />
              )}

              {field.type === "select" && (
                <select 
                  value={responses[field.id] || ""}
                  onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                  className="w-full h-12 rounded-md bg-[var(--ep-bg-deep)] border border-[var(--ep-border)] text-white px-3 focus:outline-none focus:ring-2 focus:ring-[var(--ep-accent)]"
                >
                  <option value="" disabled>Select an option...</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full sm:w-auto h-14 px-8 bg-white hover:bg-gray-200 text-black font-extrabold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50"
      >
        {isPending ? t.specialRequests.submitting : t.specialRequests.submitButton}
        {!isPending && <ArrowRight className="w-5 h-5 ml-2" />}
      </Button>
    </form>
  );
}
