"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function ModLoader() {
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
        fadeOut ? "admin-loader-fadeout" : ""
      }`}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(15, 25, 20, 0.98) 0%, rgba(8, 12, 10, 0.99) 70%, rgba(0,0,0,1) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Ambient glow behind logo */}
      <div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,169,130,0.15) 0%, rgba(80,140,120,0.08) 50%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
        }}
      />

      {/* Pulsing ring 1 */}
      <div
        className="absolute w-48 h-48 rounded-full border-2 mod-loader-ring"
        style={{ animationDelay: "0s" }}
      />
      {/* Pulsing ring 2 */}
      <div
        className="absolute w-48 h-48 rounded-full border-2 mod-loader-ring"
        style={{ animationDelay: "0.7s" }}
      />

      {/* Logo */}
      <div className="relative admin-loader-entrance">
        <div className="admin-loader-breathe" style={{ filter: "hue-rotate(80deg)" }}>
          <Image
            src="/alamo-logo.png"
            alt="El Paso Texas Border"
            width={200}
            height={200}
            className="drop-shadow-2xl"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </div>
      </div>

      {/* Text */}
      <div className="mt-8 text-center admin-loader-entrance" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-white/90 text-sm font-bold uppercase tracking-[0.3em]">
          Mod Panel
        </h2>
        <p className="text-white/30 text-xs mt-1 tracking-widest">Loading...</p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
        <div
          className="h-full admin-loader-bar"
          style={{
            background:
              "linear-gradient(90deg, transparent, #7ca982, #50a080, transparent)",
          }}
        />
      </div>
    </div>
  );
}
