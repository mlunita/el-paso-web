import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StarBackground } from "@/components/star-background";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://elpaso-rp.com'),
  title: {
    default: "El Paso, Texas: Border Roleplay | GTA RP Frontera",
    template: "%s | El Paso RP"
  },
  description: "Join the premier bilingual Mexico-USA border roleplay server. Experience realistic GTA RP as law enforcement, cartel, or civilian in El Paso & Ciudad Juárez.",
  keywords: ["Mexico USA border RP", "El Paso roleplay server", "GTA RP frontera", "bilingual roleplay server", "GTA V roleplay", "cartel RP", "border patrol RP"],
  authors: [{ name: "El Paso RP Community" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_MX",
    url: "/",
    siteName: "El Paso, Texas: Border Roleplay",
    title: "El Paso, Texas: Border Roleplay | GTA RP Frontera",
    description: "Join the premier bilingual Mexico-USA border roleplay server. Experience realistic GTA RP as law enforcement, cartel, or civilian.",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Paso, Texas: Border Roleplay | GTA RP Frontera",
    description: "Join the premier bilingual Mexico-USA border roleplay server.",
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
        <div className="fixed inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-indigo-950/10 pointer-events-none" style={{ zIndex: 1 }} />
        <div className="relative" style={{ zIndex: 2 }}>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
