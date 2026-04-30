"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { createStaff, updateStaff } from "@/app/hq/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface DiscordPreview {
  username: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
}

export function StaffForm({ member }: { member?: any }) {
  const router = useRouter();
  const { t } = useI18n();
  const updateFn = member ? updateStaff.bind(null, member.id) : createStaff;
  const [state, formAction, pending] = useActionState(updateFn, null);

  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "");
  const [discordId, setDiscordId] = useState(member?.discordId || "");
  const [order, setOrder] = useState(member?.order?.toString() || "0");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Discord preview state
  const [preview, setPreview] = useState<DiscordPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(member ? t.admin.staff.toastUpdated : t.admin.staff.toastCreated);
      router.push("/hq/staff");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, member, t]);

  // Live Discord ID preview
  useEffect(() => {
    const discordIdRegex = /^\d{17,20}$/;
    if (!discordIdRegex.test(discordId)) {
      setPreview(null);
      setPreviewError(false);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/discord/${discordId}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data?.user) {
            setPreview({
              username: data.user.username,
              global_name: data.user.global_name,
              avatar: data.user.avatar,
              banner: data.user.banner,
            });
            // Auto-fill name if empty
            if (!name || name === "Discord User") {
              setName(data.user.global_name || data.user.username || "");
            }
          } else {
            setPreviewError(true);
          }
          setPreviewLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setPreviewError(true);
            setPreviewLoading(false);
          }
        });
    }, 500); // Debounce 500ms

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [discordId]); // intentionally not including `name` to avoid loop

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    const discordIdRegex = /^\d{17,20}$/;
    if (!discordId) {
      setValidationError("Discord User ID is required.");
      return;
    }
    if (!discordIdRegex.test(discordId)) {
      setValidationError("Invalid Discord ID. It must be a numeric string (17-20 digits).");
      return;
    }

    const formData = new FormData(e.currentTarget);
    // Ensure name has a value — either user-entered or from Discord preview
    if (!formData.get("name") || (formData.get("name") as string).trim() === "") {
      formData.set("name", preview?.global_name || preview?.username || "Discord User");
    }

    // Pass Discord cache data to the server action
    // (Fields removed to match schema)

    startTransition(() => {
      formAction(formData);
    });
  };

  const previewAvatarUrl = preview?.avatar && discordId
    ? `https://cdn.discordapp.com/avatars/${discordId}/${preview.avatar}.${preview.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl bg-zinc-950/50 p-6 rounded-xl border border-white/10">

      {validationError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm font-bold">
          {validationError}
        </div>
      )}

      {/* Discord ID + Live Preview */}
      <div className="space-y-2">
        <Label htmlFor="discordId" className="text-zinc-400 font-bold">Discord User ID <span className="text-red-500">*</span></Label>
        <Input
          id="discordId"
          name="discordId"
          required
          value={discordId}
          onChange={(e) => {
            setDiscordId(e.target.value);
            setValidationError(null);
          }}
          placeholder="e.g. 156114103033757696"
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
        <p className="text-zinc-600 text-xs">The user&#39;s unique Discord ID. Used to fetch their real-time profile avatar, banner, and handle.</p>
      </div>

      {/* Discord Preview Card */}
      {(previewLoading || preview || previewError) && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          {previewLoading && (
            <div className="flex items-center gap-3 text-white/40">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Looking up Discord profile...</span>
            </div>
          )}
          {previewError && !previewLoading && (
            <div className="flex items-center gap-3 text-amber-400/80">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">Could not fetch Discord profile. The ID may be invalid, or the API is temporarily unavailable.</span>
            </div>
          )}
          {preview && !previewLoading && (
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-white/10 shadow-lg">
                {previewAvatarUrl && <AvatarImage src={previewAvatarUrl} />}
                <AvatarFallback className="bg-gradient-to-br from-[#5865F2] to-[#7289DA] text-white font-bold text-lg">
                  {(preview.global_name || preview.username)?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold truncate">
                    {preview.global_name || preview.username}
                  </span>
                  <CheckCircle className="w-4 h-4 text-[var(--ep-success)] shrink-0" />
                </div>
                <span className="text-white/40 text-sm truncate block">@{preview.username}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-400 font-bold">{t.admin.staff.name} <span className="text-zinc-600 text-xs font-normal">(fallback if Discord is unavailable)</span></Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.admin.staff.placeholders.name}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-zinc-400 font-bold">{t.admin.staff.roleTitle}</Label>
        <Input
          id="role"
          name="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder={t.admin.staff.placeholders.role}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      {/* Display Order */}
      <div className="space-y-2">
        <Label htmlFor="order" className="text-zinc-400 font-bold">{t.admin.staff.displayOrder}</Label>
        <Input
          id="order"
          name="order"
          type="number"
          required
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="bg-black/50 border-white/10 focus-visible:ring-[var(--ep-accent)]/50"
        />
      </div>

      <div className="pt-4 flex gap-4 border-t border-white/10">
        <Button onClick={() => router.push("/hq/staff")} type="button" variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/5">
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={pending} className="flex-1 bg-[var(--ep-accent)] hover:bg-[#956e47] text-white font-bold">
          {pending ? t.common.saving : t.admin.staff.saveMember}
        </Button>
      </div>
    </form>
  );
}
