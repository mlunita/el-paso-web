import { prisma } from "@/lib/prisma";
import { CheckStatusForm } from "./client-form";
import { Copy, Activity, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ refCode?: string }>;
}) {
  const { refCode } = await searchParams;
  let application = null;

  if (refCode) {
    try {
      application = await prisma.application.findUnique({
        where: { refCode: refCode.toUpperCase() },
      });
    } catch (e) {}
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { 
          bg: 'bg-emerald-500/5', 
          text: 'text-emerald-400', 
          border: 'border-emerald-500/20',
          glow: 'shadow-emerald-500/10',
          icon: <CheckCircle2 className="w-5 h-5" />
        };
      case 'REJECTED':
        return { 
          bg: 'bg-red-500/5', 
          text: 'text-red-400', 
          border: 'border-red-500/20',
          glow: 'shadow-red-500/10',
          icon: <XCircle className="w-5 h-5" />
        };
      case 'REVIEWED':
        return { 
          bg: 'bg-amber-500/5', 
          text: 'text-amber-400', 
          border: 'border-amber-500/20',
          glow: 'shadow-amber-500/10',
          icon: <Eye className="w-5 h-5" />
        };
      default:
        return { 
          bg: 'bg-zinc-800/50', 
          text: 'text-zinc-300', 
          border: 'border-white/10',
          glow: 'shadow-black/10',
          icon: <Clock className="w-5 h-5" />
        };
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto pt-8">
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="relative inline-flex items-center justify-center p-4 rounded-full mb-6">
          <div className="absolute inset-0 bg-violet-500/10 rounded-full animate-pulse-glow" />
          <div className="relative bg-violet-500/10 p-4 rounded-full border border-violet-500/15">
            <Activity className="w-10 h-10 text-violet-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mb-4">
          Application Status
        </h1>
        <p className="text-zinc-500 text-lg">Enter your unique reference code to check the status of your application.</p>
      </div>
        
      <div className="w-full animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <CheckStatusForm defaultValue={refCode} />
        
        {refCode && (
          <div className="mt-12 w-full animate-in slide-in-from-bottom-4 duration-500">
            {application ? (() => {
              const config = getStatusConfig(application.status);
              return (
                <div className="glass-card-strong rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/30 relative overflow-hidden">
                  {/* Ambient glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-600 mb-8 border-b border-white/5 pb-4 flex items-center gap-3">
                    <div className="h-[2px] w-6 bg-violet-500 rounded-full" />
                    Status Report
                  </h2>
                  
                  <div className="flex flex-col md:flex-row gap-8 justify-between items-center bg-zinc-950/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex flex-col text-center md:text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-1">Applicant</span>
                      <span className="text-2xl font-bold text-white">{application.username}</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black tracking-widest text-sm uppercase shadow-lg ${config.bg} ${config.text} ${config.border} border ${config.glow}`}>
                        {config.icon}
                        {application.status}
                      </div>
                    </div>
                  </div>

                  {application.notes && (
                    <div className="mt-6 bg-violet-500/5 border border-violet-500/10 p-6 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-[2px] w-4 bg-violet-500/50 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-widest text-violet-400/80">Admin Response</span>
                      </div>
                      <p className="text-zinc-400 italic leading-relaxed">{application.notes}</p>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-8 text-center">
                <XCircle className="w-10 h-10 text-red-400/60 mx-auto mb-3" />
                <span className="text-red-400/80 font-bold text-lg">Invalid reference code or application not found.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
