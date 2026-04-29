"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/components/i18n-provider";

export function AdminLoader() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1700);
    const removeTimer = setTimeout(() => setVisible(false), 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${
        fadeOut ? "ep-loader-fadeout" : ""
      }`}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(18, 16, 12, 0.98) 0%, rgba(6, 8, 10, 0.99) 70%, rgba(0,0,0,1) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,164,74,0.12) 0%, rgba(78,205,196,0.06) 50%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
        }}
      />

      {/* Pulsing rings */}
      <div
        className="absolute w-48 h-48 rounded-full border-2 ep-loader-ring"
        style={{ animationDelay: "0s", borderColor: "var(--ep-accent)" }}
      />
      <div
        className="absolute w-48 h-48 rounded-full border-2 ep-loader-ring"
        style={{ animationDelay: "0.7s", borderColor: "var(--ep-accent)" }}
      />

      {/* Logo */}
      <div className="relative ep-loader-entrance">
        <div className="ep-loader-breathe">
          <Image
            src="/alamo-logo.png"
            alt={t.site.alamoLogoAlt}
            width={200}
            height={200}
            className="drop-shadow-2xl"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>
      </div>

      {/* Text */}
      <div className="mt-8 text-center ep-loader-entrance" style={{ animationDelay: "0.3s" }}>
        <h2 className="font-[family-name:var(--font-heading)] text-white/90 text-sm font-bold uppercase tracking-[0.3em]">
          {t.admin.panel}
        </h2>
        <p className="text-white/30 text-xs mt-1 tracking-widest">{t.common.loading}</p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
        <div
          className="h-full ep-loader-bar"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--ep-accent), var(--ep-secondary), transparent)",
          }}
        />
      </div>
    </div>
  );
}
