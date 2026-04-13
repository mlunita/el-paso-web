"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ImageOff } from "lucide-react";
import { inspectWikiImageUrl } from "@/lib/wiki-image-url";

interface WikiItemImageProps {
  src: string | null | undefined;
  alt: string;
  variant?: "card" | "modal";
  imgClassName: string;
  fallbackClassName: string;
  children?: ReactNode;
}

export function WikiItemImage({
  src,
  alt,
  variant = "card",
  imgClassName,
  fallbackClassName,
  children,
}: WikiItemImageProps) {
  const inspection = inspectWikiImageUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasFailed = inspection.normalizedUrl !== null && failedSrc === inspection.normalizedUrl;

  if (!inspection.normalizedUrl || inspection.issue || hasFailed) {
    return (
      <div className={fallbackClassName}>
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageOff
            className={variant === "modal" ? "h-10 w-10 text-zinc-700" : "h-8 w-8 text-zinc-700"}
            aria-hidden="true"
          />
          <span
            className={
              variant === "modal"
                ? "text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500"
                : "text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500"
            }
          >
            Image unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Image
        src={inspection.normalizedUrl}
        alt={alt}
        fill
        unoptimized
        sizes="100vw"
        className={imgClassName}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(inspection.normalizedUrl)}
      />
      {children}
    </>
  );
}
