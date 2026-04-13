import { ModLoginForm } from "./client-form";
import { Shield } from "lucide-react";

export default function ModLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white relative">
      <div className="w-full max-w-md relative animate-fade-in-up">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-[#7ca982]/10 blur-3xl rounded-3xl" />

        <div className="relative glass-card-strong rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/40 border-[#7ca982]/10">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7ca982] to-transparent rounded-t-3xl" />

          <div className="flex items-center justify-center gap-3 font-black text-3xl mb-2 uppercase tracking-wide">
            <div className="relative">
              <Shield className="w-8 h-8 text-[#7ca982]" />
              <div className="absolute inset-0 bg-[#7ca982]/30 blur-lg rounded-full" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#9fcba5]">
              Mod Panel
            </span>
          </div>
          <p className="text-center text-zinc-500 text-sm">
            Enter your moderator access token to continue
          </p>

          <ModLoginForm />
        </div>
      </div>
    </div>
  );
}
