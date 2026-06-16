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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-xl border border-red-500/20 text-sm">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <Label htmlFor="token" className="text-white text-base md:text-lg font-normal">
          Enter your acces token
        </Label>
        <Input 
          id="token" 
          type="password" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          required 
          className="bg-white border-none text-black h-12 rounded-xl focus-visible:ring-0 w-full px-4 text-lg mt-2"
        />
      </div>
      <button type="submit" disabled={loading} className="hidden">Submit</button>
    </form>
  );
}
