import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-w-7xl mx-auto p-4 md:p-6 min-h-screen flex flex-col z-10">
      <Navbar />
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 flex-1 items-start">
        <main className="flex-1 w-full glass-card-strong text-slate-100 min-h-[70vh] rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-black/30 relative overflow-hidden animate-fade-in-up">
          {/* Ambient gradient orb — top left */}
          <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-amber-800/8 blur-[100px] pointer-events-none" />
          {/* Second accent orb — bottom right */}
          <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-800/6 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 w-full">
            {children}
          </div>
        </main>
        <Sidebar />
      </div>
      
      {/* Footer */}
      <footer className="mt-12 mb-4 text-center text-zinc-600 text-xs font-medium tracking-wider uppercase">
        <span className="opacity-60">El Paso, Texas: Border Roleplay By Alamo Studios</span>
      </footer>
    </div>
  );
}
