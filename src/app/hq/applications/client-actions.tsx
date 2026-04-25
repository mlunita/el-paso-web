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

export function ApplicationActions({ app }: { app: any }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatus = async (status: string) => {
    setIsUpdating(true);
    await updateApplicationStatus(app.id, status);
    setIsUpdating(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-wider text-[#a67c52]">
              Application Details
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Discord</p>
                <p className="font-medium bg-white/5 p-3 rounded-lg border border-white/5">{app.discord}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Roblox</p>
                <p className="font-medium bg-white/5 p-3 rounded-lg border border-white/5">{app.roblox}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Why do you want to join us?</p>
              <div className="bg-white/5 p-4 rounded-lg border border-white/5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {app.message}
              </div>
            </div>
            {app.links && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Experience / Links</p>
                <p className="font-medium bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                  {app.links}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Actions:</p>
              <Button 
                size="sm" 
                onClick={() => handleStatus("APPROVED")} 
                disabled={isUpdating || app.status === "APPROVED"}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                Approve
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleStatus("REJECTED")} 
                disabled={isUpdating || app.status === "REJECTED"}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Reject
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleStatus("REVIEWED")} 
                disabled={isUpdating || app.status === "REVIEWED"}
                className="bg-yellow-600 hover:bg-yellow-500 text-white"
              >
                Mark Reviewed
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
        Approve
      </Button>
      <Button 
        size="sm" 
        onClick={() => handleStatus("REJECTED")} 
        disabled={isUpdating || app.status === "REJECTED"}
        className="bg-red-600 hover:bg-red-500 text-white hidden lg:flex"
      >
        Reject
      </Button>
    </div>
  );
}
