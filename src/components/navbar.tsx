"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/wiki", label: "Wiki" },
  { href: "/ticket-status", label: "Tickets" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-4 z-50 w-full glass-card-strong rounded-2xl shadow-lg shadow-black/30 mb-8 transition-all animate-border-glow">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 text-white">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-widest uppercase hover:opacity-80 transition-opacity group">
          <div className="relative w-16 h-12 shrink-0">
            <Image src="/logo.png" alt="EPRP" fill className="object-contain" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-200 hidden lg:inline-block text-base xl:text-xl">EL PASO, TEXAS: BORDER ROLEPLAY Official Web</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-1 lg:gap-2 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 lg:px-4 py-2 text-sm font-semibold transition-colors duration-300 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#a67c52] after:rounded-full hover:after:w-3/4 after:transition-all after:duration-300 ${
                pathname === link.href ? "text-white after:!w-3/4" : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/applys" className="relative px-5 py-2 text-sm font-bold bg-gradient-to-r from-[#a67c52] to-[#7ca982] hover:from-[#b8895e] hover:to-[#8fba96] text-white rounded-xl shadow-md hover:shadow-[#a67c52]/30 hover:shadow-lg transition-all duration-300 outline outline-1 outline-[#a67c52]/30 hover:-translate-y-0.5">
            Apply Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 pb-4 pt-2 flex flex-col gap-1 animate-fade-in-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                pathname === link.href
                  ? "bg-[#a67c52]/15 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/applys"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#a67c52] to-[#7ca982] text-white text-center mt-1"
          >
            Apply Now
          </Link>
        </div>
      )}
    </nav>
  );
}
