"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Users, Activity, BookOpen, Headset } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/news", label: "News", icon: Activity },
    { href: "/wiki", label: "Wiki", icon: BookOpen },
    { href: "/applys", label: "Staff & Apply", icon: Users },
    { href: "/ticket-status", label: "Ticket Status", icon: Headset },
    { href: "/status", label: "Apply Status", icon: Search },
  ];

  return (
    <aside className="w-full md:w-72 lg:w-80 flex flex-col gap-4 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
      {links.map((link, index) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`group relative overflow-hidden w-full aspect-[2.5/1] rounded-2xl flex flex-col items-center justify-center text-lg font-bold transition-all duration-300 ${
              isActive 
                ? "text-white shadow-lg shadow-[#a67c52]/25" 
                : "glass-card text-zinc-400 hover:text-white hover:border-[#a67c52]/20"
            }`}
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            {/* Active state: gradient background */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#a67c52] via-[#b8895e] to-[#7ca982] opacity-90" />
            )}
            
            {/* Active glow border effect */}
            {isActive && (
              <div className="absolute inset-0 rounded-2xl ring-1 ring-[#a67c52]/50 animate-pulse-glow" />
            )}
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <Icon className={`w-8 h-8 transition-all duration-300 ${isActive ? "scale-110 text-white drop-shadow-lg" : "group-hover:scale-110 text-zinc-500 group-hover:text-[#a67c52]"}`} />
              <span className="tracking-wide uppercase text-sm mt-1">{link.label}</span>
            </div>
            
            {/* Hover glow effect for inactive items */}
            {!isActive && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-[#a67c52]/10 blur-2xl" />
              </div>
            )}
          </Link>
        );
      })}
    </aside>
  );
}
