"use client";

import { useActionState, useEffect, useState } from "react";
import { generateModeratorToken } from "@/app/hq/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

type RoleItem = { id: string; name: string };

export function TokenForm({ roles }: { roles: RoleItem[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(generateModeratorToken, null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state?.success && state.token) {
      toast.success(t.admin.tokens.toastGenerated);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const copyToken = () => {
    if (state?.token) {
      navigator.clipboard.writeText(state.token);
      setCopied(true);
      toast.success(t.admin.tokens.tokenCopied);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // If token was successfully generated, show the one-time display
  if (state?.success && state?.token) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-300">{t.admin.tokens.tokenGenerated}</h3>
              <p className="text-sm text-emerald-300/60">{t.admin.tokens.copyNow}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 rounded-lg p-3">
            <code className="flex-1 text-sm font-mono text-white break-all select-all">
              {state.token}
            </code>
            <button
              onClick={copyToken}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>

          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/15 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-300/80">
              {t.admin.tokens.tokenWarning}
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/hq/tokens")}
          className="bg-[var(--ep-accent)] hover:bg-[#956e47] text-white font-bold"
        >
          {t.admin.tokens.doneBack}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">
      <div className="space-y-2">
        <Label htmlFor="moderatorName" className="text-zinc-400 font-bold">{t.admin.tokens.moderatorName}</Label>
        <Input
          id="moderatorName"
          name="moderatorName"
          required
          placeholder="e.g. John Doe"
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="moderatorId" className="text-zinc-400 font-bold">{t.admin.tokens.moderatorId}</Label>
        <Input
          id="moderatorId"
          name="moderatorId"
          required
          placeholder="e.g. discord:123456789 or roblox:12345"
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
        <p className="text-xs text-white/30">{t.admin.tokens.uniqueIdHint}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="roleId" className="text-zinc-400 font-bold">{t.admin.tokens.assignRole}</Label>
        <select
          id="roleId"
          name="roleId"
          required
          className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--ep-accent)]/50"
        >
          <option value="">{t.admin.tokens.selectRole}</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
        {roles.length === 0 && (
          <p className="text-xs text-red-400">{t.admin.tokens.noRoles}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <Label htmlFor="expiresInDays" className="text-zinc-400 font-bold">Expiration</Label>
          <select
            id="expiresInDays"
            name="expiresInDays"
            defaultValue="never"
            className="w-full h-10 px-3 rounded-md bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--ep-accent)]/50"
          >
            <option value="never">Never (Not Recommended)</option>
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-zinc-400 font-bold">Internal Notes (Optional)</Label>
          <Input
            id="notes"
            name="notes"
            placeholder="Reason for token generation..."
            className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
          />
        </div>
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button
          onClick={() => router.push("/hq/tokens")}
          type="button"
          variant="outline"
          className="flex-1 border-white/10 bg-transparent hover:bg-white/5"
        >
          {t.common.cancel}
        </Button>
        <Button
          type="submit"
          disabled={pending || roles.length === 0}
          className="flex-1 bg-[var(--ep-accent)] hover:bg-[#956e47] text-white font-bold"
        >
          {pending ? t.admin.tokens.generating : t.admin.tokens.generateButton}
        </Button>
      </div>
    </form>
  );
}
