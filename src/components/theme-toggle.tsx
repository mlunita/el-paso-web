"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  // Avoid hydration mismatch — only render after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-[var(--ep-bg-elevated)] border border-[var(--ep-border)] ${className ?? ""}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t.theme.toggle}
      title={isDark ? t.theme.light : t.theme.dark}
      className={`
        relative w-9 h-9 flex items-center justify-center rounded-xl
        border border-[var(--ep-border)] bg-[var(--ep-bg-elevated)]
        hover:border-[var(--ep-border-accent)] hover:bg-[var(--ep-bg-hover)]
        transition-all duration-300 group overflow-hidden
        ${className ?? ""}
      `}
    >
      {/* Animated icon swap */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-90"
        }`}
      >
        <Moon className="w-4 h-4 text-[var(--ep-text-secondary)] group-hover:text-[var(--ep-accent)] transition-colors duration-300" />
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          !isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 rotate-90"
        }`}
      >
        <Sun className="w-4 h-4 text-[var(--ep-text-secondary)] group-hover:text-[var(--ep-accent)] transition-colors duration-300" />
      </span>
    </button>
  );
}
