"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string;
  presence_count: number;
  members: Array<{
    id: string;
    username: string;
    status: string;
    avatar_url: string;
  }>;
}

export function DiscordWidget() {
  const [data, setData] = useState<DiscordWidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidget = async () => {
      try {
        const res = await fetch("https://discord.com/api/guilds/1438039605659172997/widget.json");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch Discord widget", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWidget();
    
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchWidget, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return null;

  // Get a few online members to show their avatars
  const onlineMembers = data.members.filter(m => m.status === "online" || m.status === "idle" || m.status === "dnd").slice(0, 6);

  return (
    <div className="ep-card-glass rounded-2xl p-5 md:p-6 w-full max-w-sm mx-auto flex flex-col gap-4 border border-[var(--ep-border)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--ep-accent)]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5865F2]/10 flex items-center justify-center shrink-0">
            <Image 
              src="/discord.png" 
              alt="Discord" 
              width={22} 
              height={22} 
              className="dark:invert opacity-80" 
              unoptimized 
            />
          </div>
          <div className="flex flex-col">
            <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold text-[var(--ep-text-primary)] uppercase tracking-wider line-clamp-1">
              {data.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-[var(--ep-text-secondary)] font-medium">
                {data.presence_count.toLocaleString()} Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {onlineMembers.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            {onlineMembers.map((member, i) => (
              member.avatar_url ? (
                <div key={member.id} className="relative w-7 h-7 rounded-full border-2 border-[var(--ep-bg-deep)] z-[1]" style={{ zIndex: onlineMembers.length - i }}>
                  <img
                    className="w-full h-full rounded-full object-cover"
                    src={member.avatar_url}
                    alt={member.username}
                  />
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[var(--ep-bg-deep)] ${
                    member.status === 'online' ? 'bg-green-500' :
                    member.status === 'idle' ? 'bg-yellow-500' :
                    member.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                </div>
              ) : null
            ))}
          </div>
          <span className="text-xs text-[var(--ep-text-muted)]">
            +{Math.max(0, data.presence_count - onlineMembers.length)} more
          </span>
        </div>
      )}

      <a
        href={data.instant_invite}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-colors duration-200 text-center flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(88,101,242,0.39)] hover:shadow-[0_6px_20px_rgba(88,101,242,0.23)]"
      >
        Join Server
      </a>
    </div>
  );
}
