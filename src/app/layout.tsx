import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StarBackground } from "@/components/star-background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "El Paso, Texas: Border Roleplay",
  description: "Official community website for the border roleplay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black min-h-screen text-slate-100 antialiased`}>
        {/* Starfield behind everything */}
        <StarBackground />
        {/* Subtle global gradient overlay for depth */}
        <div className="fixed inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" style={{ zIndex: 1 }} />
        <div className="relative" style={{ zIndex: 2 }}>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
