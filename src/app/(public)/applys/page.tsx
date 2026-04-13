import { prisma } from "@/lib/prisma";
import { ApplyForm } from "./client-form";
import { FileText } from "lucide-react";

export default async function ApplyPage() {
  let settings = null;

  try {
    settings = await prisma.siteSettings.findFirst();
  } catch (e) {
    // IGNORE
  }

  const applicationsOpen = settings ? settings.appsOpen : true;

  return (
    <div className="flex flex-col gap-8 sm:gap-12 w-full">
      <div className="text-center md:text-left mb-2 animate-fade-in-up">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
          <div className="p-3 rounded-2xl bg-[#a67c52]/10 border border-[#a67c52]/20">
            <FileText className="w-8 h-8 text-[#a67c52]" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#a67c52] via-[#c9a87c] to-[#a67c52]">
            Apply Now
          </h1>
        </div>
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <div className="h-[2px] w-12 bg-gradient-to-r from-[#a67c52] to-transparent rounded-full" />
          <p className="text-zinc-500 text-base sm:text-lg">Think you have what it takes? Join our team.</p>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="glass-card-strong rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-black/30">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#a67c52] via-[#c9a87c] to-[#7ca982]" />
          {/* Corner glow */}
          <div className="absolute -top-[30%] -right-[15%] w-[50%] h-[50%] bg-[#a67c52]/5 blur-[80px] rounded-full pointer-events-none" />

          <h2 className="text-2xl sm:text-3xl font-black mb-4 uppercase tracking-wider text-white mt-2 flex items-center gap-3">
            <div className="h-[2px] w-6 bg-[#a67c52] rounded-full" />
            Join The Ranks
          </h2>
          <p className="mb-6 sm:mb-8 text-zinc-500 font-medium line-clamp-2">
            {applicationsOpen
              ? "We are currently looking for dedicated individuals. Think you have what it takes? Submit your application below."
              : "The application window is currently closed. Keep an eye on the news for our next recruitment wave!"}
          </p>

          {applicationsOpen ? (
            <ApplyForm />
          ) : (
            <div className="bg-red-500/5 p-8 sm:p-12 rounded-2xl text-center border border-red-500/15">
              <div className="text-3xl font-black uppercase tracking-widest text-red-400/70">Closed</div>
              <p className="text-red-300/50 mt-4 font-medium">Recruitment is frozen at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
