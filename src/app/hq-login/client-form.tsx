"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { authenticateAdmin } from "./actions";
import { useI18n } from "@/components/i18n-provider";

export function LoginForm() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authenticateAdmin(token);
      if (result.success) {
        router.push("/hq");
        router.refresh();
      } else {
        setError(result.error || t.auth.errors.failed);
      }
    } catch {
      setError(t.auth.errors.failedRetry);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8">
      {error && (
        <div className="bg-[var(--ep-danger)]/5 text-[var(--ep-danger)] p-3 rounded-xl border border-[var(--ep-danger)]/15 flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2 duration-300">
          <div className="w-2 h-2 bg-[var(--ep-danger)] rounded-full animate-pulse" />
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="token" className="text-[var(--ep-text-muted)] uppercase tracking-widest text-xs font-bold">
          {t.auth.admin.tokenLabel}
        </Label>
        <Input 
          id="token" 
          type="password" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          required 
          placeholder={t.auth.admin.tokenPlaceholder}
          className="bg-[var(--ep-bg-deep)] border-[var(--ep-border)] text-[var(--ep-text-primary)] placeholder:text-[var(--ep-text-muted)] h-12 transition-all duration-300"
        />
        <p className="text-xs text-[var(--ep-text-muted)] mt-1">
          {t.auth.admin.tokenHint}
        </p>
      </div>
      <Button 
        type="submit" 
        disabled={loading || !token.trim()}
        className="w-full bg-[var(--ep-accent)] hover:bg-[var(--ep-accent-hover)] text-[var(--ep-bg-deep)] py-6 text-sm font-extrabold uppercase tracking-widest shadow-lg shadow-[var(--ep-accent-glow)] hover:shadow-xl hover:shadow-[var(--ep-accent-glow)] transition-all duration-300 hover:-translate-y-0.5 mt-2 disabled:opacity-50 disabled:hover:translate-y-0 rounded-xl"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[var(--ep-bg-deep)]/30 border-t-[var(--ep-bg-deep)] rounded-full animate-spin" />
            {t.auth.admin.authenticating}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            {t.auth.admin.signIn}
          </span>
        )}
      </Button>
    </form>
  );
}
