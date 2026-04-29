import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AmbientBackground } from "@/components/ambient-background";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { CookieBanner } from "@/components/cookie-banner";
import { getRequestLocale } from "@/lib/i18n/server";
import { createRootMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800", "900"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  return createRootMetadata(await getRequestLocale());
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans bg-[var(--ep-bg-deep)] min-h-screen text-[var(--ep-text-primary)] antialiased transition-colors duration-300`}>
        <I18nProvider initialLocale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            <AmbientBackground />
            <div className="relative" style={{ zIndex: 2 }}>
              {children}
            </div>
            <CookieBanner />
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
