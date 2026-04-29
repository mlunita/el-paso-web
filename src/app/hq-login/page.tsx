import { LoginForm } from "./client-form";
import { Gamepad2 } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";

export default async function LoginPage() {
  const t = await getTranslations();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white relative">
      <div className="w-full max-w-md relative ep-fade-up">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-[var(--ep-accent)]/8 blur-3xl rounded-3xl" />
        
        <div className="relative ep-card-elevated rounded-2xl p-8 md:p-12 shadow-2xl shadow-black/40">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--ep-accent)] to-transparent rounded-t-2xl" />
          
          <div className="flex items-center justify-center gap-3 font-[family-name:var(--font-heading)] font-extrabold text-3xl mb-2 uppercase tracking-wide">
            <div className="relative">
              <Gamepad2 className="w-8 h-8 text-[var(--ep-accent)]" />
              <div className="absolute inset-0 bg-[var(--ep-accent)]/30 blur-lg rounded-full" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--ep-accent)]">{t.auth.admin.heading}</span>
          </div>
          <p className="text-center text-[var(--ep-text-secondary)] text-sm">{t.auth.admin.subtitle}</p>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
