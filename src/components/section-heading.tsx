import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  align = "left",
  className = "",
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={`flex flex-col ${align === "center" ? "items-center text-center" : ""} mb-8 sm:mb-12 ep-fade-up ${className}`}
    >
      <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""} mb-3`}>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-[var(--ep-accent-muted)] border border-[var(--ep-border-accent)]">
            <Icon className="w-5 h-5 text-[var(--ep-accent)]" />
          </div>
        )}
        <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--ep-text-primary)]">
          {title}
        </h1>
      </div>

      {subtitle && (
        <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
          <div className="h-[2px] w-10 bg-gradient-to-r from-[var(--ep-accent)] to-transparent rounded-full" />
          <p className="text-[var(--ep-text-secondary)] text-base sm:text-lg">
            {subtitle}
          </p>
        </div>
      )}
      {children}
    </div>
  );
}
