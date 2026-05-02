"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

const ENDPOINT = "/api/analytics/track";
const CLIENT_ID_KEY = "elpaso_analytics_client_id";
const SESSION_KEY = "elpaso_analytics_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const EXCLUDED_PREFIXES = ["/hq", "/hq-login", "/mod", "/mod-login", "/api", "/_next"];

type AnalyticsType = "pageview" | "event" | "vital";

type AnalyticsPayload = {
  type: AnalyticsType;
  clientId: string;
  sessionId: string;
  path: string;
  title: string;
  referrer: string;
  url: string;
  language: string;
  timezone?: string;
  viewport: {
    width: number;
    height: number;
  };
  event?: {
    name: string;
    category?: string;
    label?: string;
    value?: number;
    metadata?: Record<string, string | number | boolean | null>;
  };
  metric?: {
    id: string;
    name: string;
    value: number;
    delta: number;
    rating?: string;
    navigationType?: string;
  };
};

type StoredSession = {
  id: string;
  lastSeenAt: number;
};

let lastPageviewKey = "";
let lastPageviewAt = 0;

function createId(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${id}`;
}

function readStorage(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage can be unavailable in strict privacy contexts.
  }
}

function getClientId() {
  const existing = readStorage(window.localStorage, CLIENT_ID_KEY);
  if (existing) return existing;

  const nextId = createId("vis");
  writeStorage(window.localStorage, CLIENT_ID_KEY, nextId);
  return nextId;
}

function getSessionId() {
  const now = Date.now();
  const raw = readStorage(window.sessionStorage, SESSION_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (parsed.id && now - parsed.lastSeenAt < SESSION_TIMEOUT_MS) {
        writeStorage(window.sessionStorage, SESSION_KEY, JSON.stringify({ id: parsed.id, lastSeenAt: now }));
        return parsed.id;
      }
    } catch {
      // Start a clean session below.
    }
  }

  const nextSession = { id: createId("ses"), lastSeenAt: now };
  writeStorage(window.sessionStorage, SESSION_KEY, JSON.stringify(nextSession));
  return nextSession.id;
}

function shouldTrack(path: string) {
  return !EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function basePayload(type: AnalyticsType): AnalyticsPayload | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  const path = window.location.pathname;
  if (!shouldTrack(path)) return null;

  return {
    type,
    clientId: getClientId(),
    sessionId: getSessionId(),
    path,
    title: document.title || path,
    referrer: document.referrer || "",
    url: window.location.href,
    language: navigator.language || "",
    timezone: getTimezone(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}

function sendAnalytics(payload: AnalyticsPayload) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(ENDPOINT, blob);
    return;
  }

  fetch(ENDPOINT, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => {
    // Analytics should never affect the user's page.
  });
}

const reportWebVitals: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  const payload = basePayload("vital");
  if (!payload) return;

  sendAnalytics({
    ...payload,
    metric: {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      navigationType: metric.navigationType,
    },
  });
};

export function AnalyticsTracker() {
  const pathname = usePathname();

  useReportWebVitals(reportWebVitals);

  useEffect(() => {
    if (!pathname || !shouldTrack(pathname)) return;

    const pageviewKey = `${pathname}:${document.title}`;
    const now = Date.now();
    if (pageviewKey === lastPageviewKey && now - lastPageviewAt < 1200) return;

    lastPageviewKey = pageviewKey;
    lastPageviewAt = now;

    const timer = window.setTimeout(() => {
      const payload = basePayload("pageview");
      if (payload) sendAnalytics(payload);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement)) return;

      let url: URL;
      try {
        url = new URL(target.href);
      } catch {
        return;
      }

      if (url.origin === window.location.origin) return;

      const payload = basePayload("event");
      if (!payload) return;

      sendAnalytics({
        ...payload,
        event: {
          name: "external_link_click",
          category: "engagement",
          label: url.hostname,
          metadata: {
            href: target.href.slice(0, 300),
            text: target.textContent?.trim().slice(0, 120) || null,
          },
        },
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
