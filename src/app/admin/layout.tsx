"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, FileText, Users, Settings, LogOut, FileBadge } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/posts", label: "News Posts", icon: FileText },
    { href: "/admin/applications", label: "Applications", icon: FileBadge },
    { href: "/admin/staff", label: "Staff", icon: Users },
    { href: "/admin/settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black flex text-white font-sans">
      <aside className="w-64 bg-[#8b5cf6] p-6 flex flex-col gap-6 fixed h-full border-r border-white/10 shadow-2xl">
        <div className="font-black text-2xl tracking-widest uppercase mb-4 text-center border-b border-white/20 pb-4">
          Admin Panel
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors font-semibold ${
                  isActive ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/70"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-100 transition-colors mt-auto font-bold border border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>
      
      <main className="flex-1 ml-64 p-8 bg-black">
        <div className="bg-white/5 rounded-3xl min-h-[80vh] p-8 border border-white/10">
          {children}
        </div>
      </main>
    </div>
  );
}
