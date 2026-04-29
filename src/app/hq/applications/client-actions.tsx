"use client";

import { updateApplicationStatus } from "@/app/hq/actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function ApplicationActions({ app }: { app: any }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useI18n();

  const handleStatus = async (status: string) => {
    setIsUpdating(true);
    await updateApplicationStatus(app.id, status);
    setIsUpdating(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <Dialog>
        <DialogTrigger render={<Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" />}>
          <Eye className="w-4 h-4 mr-2" />
          {t.common.view}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-wider text-[var(--ep-accent)]">
              {t.admin.applications.details}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.admin.applications.discord}</p>
                <p className="font-medium bg-white/5 p-3 rounded-lg border border-white/5">{app.discord}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.admin.applications.roblox}</p>
                <p className="font-medium bg-white/5 p-3 rounded-lg border border-white/5">{app.roblox}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.apply.form.message}</p>
              <div className="bg-white/5 p-4 rounded-lg border border-white/5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {app.message}
              </div>
            </div>
            {app.links && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.admin.applications.experience}</p>
                <p className="font-medium bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                  {app.links}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{t.admin.applications.actionsLabel}</p>
              <Button 
                size="sm" 
                onClick={() => handleStatus("APPROVED")} 
                disabled={isUpdating || app.status === "APPROVED"}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                {t.common.approve}
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleStatus("REJECTED")} 
                disabled={isUpdating || app.status === "REJECTED"}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                {t.common.reject}
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleStatus("REVIEWED")} 
                disabled={isUpdating || app.status === "REVIEWED"}
                className="bg-yellow-600 hover:bg-yellow-500 text-white"
              >
                {t.admin.applications.markReviewed}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        size="sm" 
        onClick={() => handleStatus("APPROVED")} 
        disabled={isUpdating || app.status === "APPROVED"}
        className="bg-green-600 hover:bg-green-500 text-white hidden lg:flex"
      >
        {t.common.approve}
      </Button>
      <Button 
        size="sm" 
        onClick={() => handleStatus("REJECTED")} 
        disabled={isUpdating || app.status === "REJECTED"}
        className="bg-red-600 hover:bg-red-500 text-white hidden lg:flex"
      >
        {t.common.reject}
      </Button>
    </div>
  );
}
