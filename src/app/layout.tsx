import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StarBackground } from "@/components/star-background";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://elpaso-rp.com'),
  title: {
    default: "El Paso, Texas: Border Roleplay | Roblox Frontera RP",
    template: "%s | El Paso RP"
  },
  description: "Join the premier bilingual Mexico-USA border roleplay experience on Roblox. Experience realistic RP as law enforcement, cartel, or civilian in El Paso & Ciudad Juárez.",
  keywords: ["Mexico USA border RP", "El Paso roleplay game", "Roblox RP frontera", "bilingual roleplay server", "Roblox roleplay", "cartel RP", "border patrol RP"],
  authors: [{ name: "El Paso RP Community" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_MX",
    url: "/",
    siteName: "El Paso, Texas: Border Roleplay",
    title: "El Paso, Texas: Border Roleplay | Roblox Frontera RP",
    description: "Join the premier bilingual Mexico-USA border roleplay experience on Roblox. Experience realistic RP as law enforcement, cartel, or civilian.",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Paso, Texas: Border Roleplay | Roblox Frontera RP",
    description: "Join the premier bilingual Mexico-USA border roleplay experience on Roblox.",
  },
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
        <div className="fixed inset-0 bg-gradient-to-b from-amber-950/15 via-transparent to-emerald-950/8 pointer-events-none" style={{ zIndex: 1 }} />
        <div className="relative" style={{ zIndex: 2 }}>
          {children}
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
