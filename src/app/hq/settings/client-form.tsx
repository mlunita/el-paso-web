"use client";

import { useActionState, useState } from "react";
import { updateSettings } from "@/app/hq/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/components/i18n-provider";

const TICKET_STATUSES = [
  {
    value: "GREEN",
    label: "Green — Normal",
    message: "Tickets run normally, support is available.",
    color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    value: "YELLOW",
    label: "Yellow — Minor Delays",
    message: "We are experiencing difficulties with tickets. Response time may take more than 30 minutes.",
    color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
    dot: "bg-yellow-500",
  },
  {
    value: "ORANGE",
    label: "Orange — High Volume",
    message: "We are receiving a high volume of tickets. Response time may take up to 2 hours.",
    color: "border-orange-500/50 bg-orange-500/10 text-orange-300",
    dot: "bg-orange-500",
  },
  {
    value: "RED",
    label: "Red — Overloaded",
    message: "We are overloaded with tickets and are prioritizing cheater reports. Response time may take up to 1 day, or your ticket may be closed for this reason.",
    color: "border-red-500/50 bg-red-500/10 text-red-300",
    dot: "bg-red-500",
  },
];

export function SettingsForm({ defaultValues }: { defaultValues: any }) {
  const [state, formAction, isPending] = useActionState(updateSettings, null);
  const [ticketStatus, setTicketStatus] = useState(defaultValues?.ticketStatus || "GREEN");
  const { t } = useI18n();

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      {state?.success && (
        <div className="bg-green-500/20 text-green-200 p-3 rounded-lg border border-green-500/50">
          {t.admin.settings.updated}
        </div>
      )}
      {state?.error && (
        <div className="bg-red-500/20 text-red-200 p-3 rounded-lg border border-red-500/50">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.admin.settings.bannerImage}</Label>
        <Input 
          name="bannerImage" 
          defaultValue={defaultValues?.bannerImage || ""} 
          className="bg-black/20 border-white/10"
          placeholder="https://example.com/banner.jpg"
        />
        {defaultValues?.bannerImage && (
          <div className="mt-2 text-sm text-zinc-500">
            <img src={defaultValues.bannerImage} className="w-full h-32 object-cover rounded-md opacity-80" alt={t.admin.settings.bannerPreview} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t.admin.settings.bannerTitle}</Label>
        <Input 
          name="bannerTitle" 
          defaultValue={defaultValues?.bannerTitle || ""} 
          required 
          className="bg-black/20 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label>{t.admin.settings.bannerSubtitle}</Label>
        <Input 
          name="bannerSubtitle" 
          defaultValue={defaultValues?.bannerSubtitle || ""} 
          required 
          className="bg-black/20 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label>{t.admin.settings.shortDescription}</Label>
        <Textarea 
          name="description" 
          defaultValue={defaultValues?.description || ""} 
          required 
          className="bg-black/20 border-white/10"
        />
      </div>

      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          id="appsOpen" 
          name="appsOpen" 
          defaultChecked={defaultValues?.appsOpen ?? true} 
          className="w-5 h-5 accent-[var(--ep-accent)]"
        />
        <Label htmlFor="appsOpen" className="text-lg">{t.admin.settings.applicationsOpen}</Label>
      </div>

      {/* Ticket Support Status */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <Label className="text-lg font-black uppercase tracking-wider">{t.admin.settings.ticketStatus}</Label>
        <p className="text-zinc-500 text-sm">{t.admin.settings.ticketStatusHelp}</p>
        
        <input type="hidden" name="ticketStatus" value={ticketStatus} />

        <div className="grid grid-cols-1 gap-3">
          {TICKET_STATUSES.map((status) => (
            <label
              key={status.value}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                ticketStatus === status.value
                  ? status.color
                  : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="ticketStatusRadio"
                value={status.value}
                checked={ticketStatus === status.value}
                onChange={() => setTicketStatus(status.value)}
                className="mt-1 accent-white"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                  <span className="font-bold text-sm">{t.admin.settings.statuses[status.value as keyof typeof t.admin.settings.statuses]}</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">{t.ticketStatus.statuses[status.value as keyof typeof t.ticketStatus.statuses].message}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="bg-[var(--ep-accent)] hover:bg-[#956e47] text-lg py-6 max-w-xs border-0 text-white">
        {isPending ? t.common.saving : t.admin.settings.saveSettings}
      </Button>
    </form>
  );
}
