import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="sticky top-4 z-50 w-full h-16 glass-card-strong rounded-2xl flex items-center justify-between px-6 md:px-8 text-white shadow-lg shadow-black/30 mb-8 transition-all animate-border-glow">
      <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-widest uppercase hover:opacity-80 transition-opacity group">
        <div className="relative w-16 h-12">
          <Image src="/logo.png" alt="EPRP" fill className="object-contain" />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-200 hidden sm:inline-block">EL PASO, TEXAS: BORDER ROLEPLAY Official Web</span>
      </Link>
      <div className="flex gap-2 md:gap-4 items-center">
        <Link href="/" className="relative px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-violet-500 after:rounded-full hover:after:w-3/4 after:transition-all after:duration-300">
          Home
        </Link>
        <Link href="/news" className="relative px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-violet-500 after:rounded-full hover:after:w-3/4 after:transition-all after:duration-300">
          News
        </Link>
        <Link href="/applys" className="relative px-5 py-2 text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-md hover:shadow-violet-500/30 hover:shadow-lg transition-all duration-300 outline outline-1 outline-violet-500/30 hover:-translate-y-0.5">
          Apply Now
        </Link>
      </div>
    </nav>
  );
}
