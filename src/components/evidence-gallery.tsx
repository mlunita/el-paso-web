"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Play, ImageIcon, Video } from "lucide-react";

type Evidence = {
  id: string;
  type: string; // "IMAGE" | "VIDEO"
  url: string;
  caption?: string | null;
};

export function EvidenceGallery({ evidence }: { evidence: Evidence[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<string>("IMAGE");

  if (evidence.length === 0) {
    return (
      <div className="text-white/30 text-sm italic py-4">No evidence attached.</div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {evidence.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setLightboxUrl(item.url);
              setLightboxType(item.type);
            }}
            className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-[var(--ep-accent)]/40 transition-all duration-300 bg-black/40"
          >
            {item.type === "IMAGE" ? (
              <Image
                src={item.url}
                alt={item.caption || "Evidence"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play className="w-6 h-6 text-white/70" />
                </div>
                <span className="text-xs text-white/40">Video</span>
              </div>
            )}
            {/* Type indicator */}
            <div className="absolute top-2 left-2">
              {item.type === "IMAGE" ? (
                <ImageIcon className="w-4 h-4 text-white/50 drop-shadow" />
              ) : (
                <Video className="w-4 h-4 text-white/50 drop-shadow" />
              )}
            </div>
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <span className="text-[10px] text-white/70 truncate block">{item.caption}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxType === "IMAGE" ? (
              <div className="relative w-full h-[80vh]">
                <Image
                  src={lightboxUrl}
                  alt="Evidence"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <video
                src={lightboxUrl}
                controls
                className="w-full max-h-[80vh] rounded-xl"
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
