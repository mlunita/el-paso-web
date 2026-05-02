import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import crypto from "crypto";

export interface AnalyticsKPI {
  visitors: number;
  activeVisitors: number;
  sessions: number;
  pageViews: number;
  eventCount: number;
  avgSessionDuration: number;
  bounceRate: number;
  newVisitors: number;
  returningVisitors: number;
  pagesPerSession: number;
}

export interface TrendPoint {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  events: number;
}

export interface TopPage {
  path: string;
  title: string;
  views: number;
  users: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface CountryData {
  country: string;
  users: number;
  sessions: number;
  pageViews: number;
}

export interface DeviceCategory {
  category: string;
  users: number;
  sessions: number;
  percentage: number;
}

export interface BrowserData {
  browser: string;
  users: number;
  sessions: number;
}

export interface TopEvent {
  name: string;
  category: string;
  count: number;
}

export interface WebVitalMetric {
  name: string;
  average: number;
  p75: number;
  count: number;
  good: number;
  needsImprovement: number;
  poor: number;
}

export interface AnalyticsSummary {
  topPage: string;
  topCountry: string;
  topDevice: string;
  topSource: string;
}

export interface AnalyticsData {
  kpis: AnalyticsKPI;
  trend: TrendPoint[];
  topPages: TopPage[];
  trafficSources: TrafficSource[];
  countries: CountryData[];
  devices: DeviceCategory[];
  browsers: BrowserData[];
  topEvents: TopEvent[];
  webVitals: WebVitalMetric[];
  summary: AnalyticsSummary;
  dateRange: { start: string; end: string };
}

type AnalyticsPayload = {
  type?: unknown;
  clientId?: unknown;
  sessionId?: unknown;
  path?: unknown;
  title?: unknown;
  referrer?: unknown;
  url?: unknown;
  language?: unknown;
  timezone?: unknown;
  viewport?: unknown;
  event?: unknown;
  metric?: unknown;
};

type ClientInfo = {
  deviceType: string;
  browser: string;
  os: string;
};

type GeoInfo = {
  country?: string;
  region?: string;
  city?: string;
};

type TrafficInfo = {
  source: string;
  medium: string;
  campaign?: string;
};

const SESSION_TIMEOUT_MINUTES = 30;
const EXCLUDED_PATH_PREFIXES = [
  "/api",
  "/hq",
  "/hq-login",
  "/mod",
  "/mod-login",
  "/_next",
];

function clampDays(days: number) {
  return Math.min(Math.max(days || 30, 1), 365);
}

function getDateWindow(days: number) {
  const safeDays = clampDays(days);
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - safeDays + 1);
  return { start, end: now };
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toNumber(value: unknown) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function safeString(value: unknown, max = 255) {
  if (typeof value !== "string") return undefined;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, max) : undefined;
}

function safePath(value: unknown) {
  const path = safeString(value, 512);
  if (!path) return "/";

  try {
    const parsed = new URL(path, "https://local.invalid");
    return parsed.pathname || "/";
  } catch {
    return path.startsWith("/") ? path.split("?")[0].slice(0, 512) : "/";
  }
}

function isExcludedPath(path: string) {
  return EXCLUDED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function getHeader(request: NextRequest, name: string) {
  return request.headers.get(name) || undefined;
}

function getIpAddress(request: NextRequest) {
  const forwarded = getHeader(request, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return getHeader(request, "x-real-ip");
}

function hashValue(value: string) {
  const salt = process.env.ANALYTICS_SALT || process.env.ADMIN_SESSION_SECRET || "el-paso-analytics";
  return crypto.createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function fallbackClientId(request: NextRequest) {
  const ip = getIpAddress(request) || "unknown-ip";
  const userAgent = getHeader(request, "user-agent") || "unknown-agent";
  return `srv_${hashValue(`${ip}:${userAgent}`).slice(0, 32)}`;
}

function fallbackSessionId(clientId: string) {
  const bucket = Math.floor(Date.now() / (SESSION_TIMEOUT_MINUTES * 60 * 1000));
  return `${clientId}_${bucket}`;
}

function isBotUserAgent(userAgent: string) {
  return /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|whatsapp|telegram/i.test(userAgent);
}

function parseClientInfo(userAgent: string): ClientInfo {
  const ua = userAgent.toLowerCase();
  const deviceType = /ipad|tablet|kindle|silk/.test(ua)
    ? "tablet"
    : /mobile|iphone|android/.test(ua)
      ? "mobile"
      : "desktop";

  let browser = "Other";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/opr\//.test(ua) || /opera/.test(ua)) browser = "Opera";
  else if (/samsungbrowser/.test(ua)) browser = "Samsung Internet";
  else if (/chrome|crios/.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/.test(ua)) browser = "Firefox";
  else if (/safari/.test(ua)) browser = "Safari";

  let os = "Other";
  if (/windows/.test(ua)) os = "Windows";
  else if (/mac os|macintosh/.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/.test(ua)) os = "iOS";
  else if (/android/.test(ua)) os = "Android";
  else if (/linux/.test(ua)) os = "Linux";

  return { deviceType, browser, os };
}

function countryNameFromCode(code?: string) {
  if (!code || code === "XX") return undefined;
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(code.toUpperCase()) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

function parseGeoInfo(request: NextRequest): GeoInfo {
  const countryCode =
    getHeader(request, "x-vercel-ip-country") ||
    getHeader(request, "cf-ipcountry") ||
    getHeader(request, "x-country");

  const city = getHeader(request, "x-vercel-ip-city");
  const region = getHeader(request, "x-vercel-ip-country-region");

  return {
    country: countryNameFromCode(countryCode),
    region: region ? decodeURIComponent(region) : undefined,
    city: city ? decodeURIComponent(city) : undefined,
  };
}

function parseTrafficInfo(urlValue?: string, referrerValue?: string): TrafficInfo {
  let url: URL | undefined;
  try {
    url = urlValue ? new URL(urlValue) : undefined;
  } catch {
    url = undefined;
  }

  const utmSource = safeString(url?.searchParams.get("utm_source"), 120);
  const utmMedium = safeString(url?.searchParams.get("utm_medium"), 120);
  const utmCampaign = safeString(url?.searchParams.get("utm_campaign"), 160);

  if (utmSource || utmMedium) {
    return {
      source: utmSource || "campaign",
      medium: utmMedium || "campaign",
      campaign: utmCampaign,
    };
  }

  if (!referrerValue) return { source: "direct", medium: "none" };

  try {
    const referrer = new URL(referrerValue);
    if (url && referrer.hostname === url.hostname) {
      return { source: "direct", medium: "none" };
    }

    const host = referrer.hostname.replace(/^www\./, "");
    if (/google|bing|duckduckgo|yahoo|yandex|baidu/.test(host)) {
      return { source: host, medium: "organic" };
    }
    if (/discord|tiktok|twitter|x\.com|facebook|instagram|youtube|reddit/.test(host)) {
      return { source: host, medium: "social" };
    }
    return { source: host, medium: "referral" };
  } catch {
    return { source: "direct", medium: "none" };
  }
}

function safeViewport(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { width: undefined, height: undefined };
  }
  const viewport = value as Record<string, unknown>;
  const width = Number(viewport.width);
  const height = Number(viewport.height);
  return {
    width: Number.isFinite(width) ? Math.max(0, Math.round(width)) : undefined,
    height: Number.isFinite(height) ? Math.max(0, Math.round(height)) : undefined,
  };
}

function safeMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, item] of Object.entries(value).slice(0, 20)) {
    const cleanKey = safeString(key, 60);
    if (!cleanKey) continue;

    if (typeof item === "string") output[cleanKey] = item.slice(0, 300);
    else if (typeof item === "number" && Number.isFinite(item)) output[cleanKey] = item;
    else if (typeof item === "boolean") output[cleanKey] = item;
    else if (item === null) output[cleanKey] = null;
  }

  return Object.keys(output).length ? output : undefined;
}

async function ensureVisitorAndSession(
  request: NextRequest,
  payload: AnalyticsPayload,
  path: string,
) {
  const now = new Date();
  const userAgent = getHeader(request, "user-agent") || "";
  const clientInfo = parseClientInfo(userAgent);
  const geoInfo = parseGeoInfo(request);
  const language = safeString(payload.language, 80) || safeString(getHeader(request, "accept-language"), 120);
  const timezone = safeString(payload.timezone, 80);
  const clientId = safeString(payload.clientId, 128) || fallbackClientId(request);
  const sessionPublicId = safeString(payload.sessionId, 160) || fallbackSessionId(clientId);
  const referrer = safeString(payload.referrer, 1024);
  const url = safeString(payload.url, 1024);
  const traffic = parseTrafficInfo(url, referrer);

  const visitor = await prisma.analyticsVisitor.upsert({
    where: { clientId },
    create: {
      clientId,
      country: geoInfo.country,
      region: geoInfo.region,
      city: geoInfo.city,
      timezone,
      language,
      deviceType: clientInfo.deviceType,
      browser: clientInfo.browser,
      os: clientInfo.os,
      firstSeenAt: now,
      lastSeenAt: now,
    },
    update: {
      country: geoInfo.country,
      region: geoInfo.region,
      city: geoInfo.city,
      timezone,
      language,
      deviceType: clientInfo.deviceType,
      browser: clientInfo.browser,
      os: clientInfo.os,
      lastSeenAt: now,
    },
  });

  const existingSession = await prisma.analyticsSession.findUnique({
    where: { sessionId: sessionPublicId },
    select: { id: true, startedAt: true },
  });

  if (existingSession) {
    const durationSeconds = Math.max(
      0,
      Math.round((now.getTime() - existingSession.startedAt.getTime()) / 1000),
    );
    const session = await prisma.analyticsSession.update({
      where: { id: existingSession.id },
      data: {
        lastSeenAt: now,
        durationSeconds,
        exitPath: path,
        country: geoInfo.country,
        region: geoInfo.region,
        city: geoInfo.city,
        deviceType: clientInfo.deviceType,
        browser: clientInfo.browser,
        os: clientInfo.os,
        language,
        timezone,
      },
    });
    return { visitor, session, geoInfo, clientInfo, language, timezone, referrer };
  }

  const session = await prisma.analyticsSession.create({
    data: {
      sessionId: sessionPublicId,
      visitorId: visitor.id,
      startedAt: now,
      lastSeenAt: now,
      entryPath: path,
      exitPath: path,
      referrer,
      source: traffic.source,
      medium: traffic.medium,
      campaign: traffic.campaign,
      country: geoInfo.country,
      region: geoInfo.region,
      city: geoInfo.city,
      deviceType: clientInfo.deviceType,
      browser: clientInfo.browser,
      os: clientInfo.os,
      language,
      timezone,
    },
  });

  return { visitor, session, geoInfo, clientInfo, language, timezone, referrer };
}

export async function recordAnalyticsPayload(request: NextRequest, payload: AnalyticsPayload) {
  const userAgent = getHeader(request, "user-agent") || "";
  if (isBotUserAgent(userAgent)) return { tracked: false, reason: "bot" };

  const type = safeString(payload.type, 32);
  const path = safePath(payload.path);
  if (!type || isExcludedPath(path)) return { tracked: false, reason: "excluded" };

  const context = await ensureVisitorAndSession(request, payload, path);

  if (type === "pageview") {
    const viewport = safeViewport(payload.viewport);
    await prisma.analyticsPageView.create({
      data: {
        visitorId: context.visitor.id,
        sessionId: context.session.id,
        path,
        title: safeString(payload.title, 255),
        referrer: context.referrer,
        country: context.geoInfo.country,
        region: context.geoInfo.region,
        city: context.geoInfo.city,
        deviceType: context.clientInfo.deviceType,
        browser: context.clientInfo.browser,
        os: context.clientInfo.os,
        language: context.language,
        timezone: context.timezone,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
      },
    });

    return { tracked: true };
  }

  if (type === "event") {
    const event = payload.event && typeof payload.event === "object" ? payload.event as Record<string, unknown> : {};
    const name = safeString(event.name, 120);
    if (!name) return { tracked: false, reason: "missing_event_name" };

    await prisma.analyticsEvent.create({
      data: {
        visitorId: context.visitor.id,
        sessionId: context.session.id,
        name,
        category: safeString(event.category, 120),
        path,
        label: safeString(event.label, 255),
        value: typeof event.value === "number" && Number.isFinite(event.value) ? event.value : undefined,
        metadata: safeMetadata(event.metadata),
      },
    });

    return { tracked: true };
  }

  if (type === "vital") {
    const metric = payload.metric && typeof payload.metric === "object" ? payload.metric as Record<string, unknown> : {};
    const name = safeString(metric.name, 80);
    const value = Number(metric.value);
    if (!name || !Number.isFinite(value)) return { tracked: false, reason: "invalid_metric" };

    await prisma.analyticsWebVital.create({
      data: {
        visitorId: context.visitor.id,
        sessionId: context.session.id,
        metricId: safeString(metric.id, 160),
        name,
        value,
        delta: typeof metric.delta === "number" && Number.isFinite(metric.delta) ? metric.delta : undefined,
        rating: safeString(metric.rating, 40),
        navigationType: safeString(metric.navigationType, 80),
        path,
      },
    });

    return { tracked: true };
  }

  return { tracked: false, reason: "unknown_type" };
}

export async function getAnalyticsSummary(days: number = 30): Promise<AnalyticsData> {
  const safeDays = clampDays(days);
  const { start, end } = getDateWindow(safeDays);
  const activeSince = new Date(Date.now() - 15 * 60 * 1000);

  const kpiRows = await prisma.$queryRaw<Array<{
    pageViews: number;
    visitors: number;
    sessions: number;
    newVisitors: number;
  }>>`
    SELECT
      COUNT(*)::int AS "pageViews",
      COUNT(DISTINCT pv."visitorId")::int AS "visitors",
      COUNT(DISTINCT pv."sessionId")::int AS "sessions",
      (COUNT(DISTINCT pv."visitorId") FILTER (WHERE v."firstSeenAt" >= ${start}))::int AS "newVisitors"
    FROM "AnalyticsPageView" pv
    INNER JOIN "AnalyticsVisitor" v ON v."id" = pv."visitorId"
    WHERE pv."createdAt" >= ${start} AND pv."createdAt" <= ${end}
  `;

  const sessionRows = await prisma.$queryRaw<Array<{
    sessions: number;
    avgDuration: number;
    bounces: number;
  }>>`
    SELECT
      COUNT(*)::int AS "sessions",
      COALESCE(AVG(s."durationSeconds"), 0)::float AS "avgDuration",
      (COUNT(*) FILTER (WHERE COALESCE(pv."views", 0) <= 1))::int AS "bounces"
    FROM "AnalyticsSession" s
    LEFT JOIN (
      SELECT "sessionId", COUNT(*)::int AS "views"
      FROM "AnalyticsPageView"
      GROUP BY "sessionId"
    ) pv ON pv."sessionId" = s."id"
    WHERE s."startedAt" >= ${start} AND s."startedAt" <= ${end}
  `;

  const eventCount = await prisma.analyticsEvent.count({ where: { createdAt: { gte: start, lte: end } } });
  const activeVisitors = await prisma.analyticsVisitor.count({ where: { lastSeenAt: { gte: activeSince } } });

  const trendRows = await prisma.$queryRaw<Array<{
    date: string;
    visitors: number;
    sessions: number;
    pageViews: number;
  }>>`
    SELECT
      to_char(date_trunc('day', "createdAt"), 'YYYYMMDD') AS "date",
      COUNT(DISTINCT "visitorId")::int AS "visitors",
      COUNT(DISTINCT "sessionId")::int AS "sessions",
      COUNT(*)::int AS "pageViews"
    FROM "AnalyticsPageView"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const eventTrendRows = await prisma.$queryRaw<Array<{ date: string; events: number }>>`
    SELECT
      to_char(date_trunc('day', "createdAt"), 'YYYYMMDD') AS "date",
      COUNT(*)::int AS "events"
    FROM "AnalyticsEvent"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const topPagesRows = await prisma.$queryRaw<Array<{
    path: string;
    title: string | null;
    views: number;
    users: number;
  }>>`
    SELECT
      "path",
      MAX("title") AS "title",
      COUNT(*)::int AS "views",
      COUNT(DISTINCT "visitorId")::int AS "users"
    FROM "AnalyticsPageView"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY "path"
    ORDER BY "views" DESC
    LIMIT 10
  `;

  const sourceRows = await prisma.$queryRaw<Array<{
    source: string;
    medium: string;
    sessions: number;
    users: number;
  }>>`
    SELECT
      COALESCE("source", 'direct') AS "source",
      COALESCE("medium", 'none') AS "medium",
      COUNT(*)::int AS "sessions",
      COUNT(DISTINCT "visitorId")::int AS "users"
    FROM "AnalyticsSession"
    WHERE "startedAt" >= ${start} AND "startedAt" <= ${end}
    GROUP BY "source", "medium"
    ORDER BY "sessions" DESC
    LIMIT 10
  `;

  const countryRows = await prisma.$queryRaw<Array<{
    country: string;
    users: number;
    sessions: number;
    pageViews: number;
  }>>`
    SELECT
      COALESCE("country", 'Unknown') AS "country",
      COUNT(DISTINCT "visitorId")::int AS "users",
      COUNT(DISTINCT "sessionId")::int AS "sessions",
      COUNT(*)::int AS "pageViews"
    FROM "AnalyticsPageView"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY "country"
    ORDER BY "users" DESC
    LIMIT 10
  `;

  const deviceRows = await prisma.$queryRaw<Array<{
    category: string;
    users: number;
    sessions: number;
  }>>`
    SELECT
      COALESCE("deviceType", 'unknown') AS "category",
      COUNT(DISTINCT "visitorId")::int AS "users",
      COUNT(DISTINCT "sessionId")::int AS "sessions"
    FROM "AnalyticsPageView"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY "deviceType"
    ORDER BY "users" DESC
  `;

  const browserRows = await prisma.$queryRaw<Array<{
    browser: string;
    users: number;
    sessions: number;
  }>>`
    SELECT
      COALESCE("browser", 'Other') AS "browser",
      COUNT(DISTINCT "visitorId")::int AS "users",
      COUNT(DISTINCT "sessionId")::int AS "sessions"
    FROM "AnalyticsPageView"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY "browser"
    ORDER BY "users" DESC
    LIMIT 8
  `;

  const topEventRows = await prisma.$queryRaw<Array<{
    name: string;
    category: string | null;
    count: number;
  }>>`
    SELECT
      "name",
      COALESCE("category", 'general') AS "category",
      COUNT(*)::int AS "count"
    FROM "AnalyticsEvent"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY "name", "category"
    ORDER BY "count" DESC
    LIMIT 8
  `;

  const webVitalRows = await prisma.$queryRaw<Array<{
    name: string;
    average: number;
    p75: number;
    count: number;
    good: number;
    needsImprovement: number;
    poor: number;
  }>>`
    SELECT
      "name",
      COALESCE(AVG("value"), 0)::float AS "average",
      COALESCE(percentile_cont(0.75) WITHIN GROUP (ORDER BY "value"), 0)::float AS "p75",
      COUNT(*)::int AS "count",
      (COUNT(*) FILTER (WHERE "rating" = 'good'))::int AS "good",
      (COUNT(*) FILTER (WHERE "rating" = 'needs-improvement'))::int AS "needsImprovement",
      (COUNT(*) FILTER (WHERE "rating" = 'poor'))::int AS "poor"
    FROM "AnalyticsWebVital"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY "name"
    ORDER BY "count" DESC
  `;

  const kpi = kpiRows[0] || { pageViews: 0, visitors: 0, sessions: 0, newVisitors: 0 };
  const sessions = Math.max(toNumber(sessionRows[0]?.sessions), toNumber(kpi.sessions));
  const pageViews = toNumber(kpi.pageViews);
  const visitors = toNumber(kpi.visitors);
  const newVisitors = Math.min(toNumber(kpi.newVisitors), visitors);
  const bounces = toNumber(sessionRows[0]?.bounces);
  const avgSessionDuration = Math.round(toNumber(sessionRows[0]?.avgDuration));
  const bounceRate = sessions > 0 ? Math.round((bounces / sessions) * 1000) / 10 : 0;
  const pagesPerSession = sessions > 0 ? Math.round((pageViews / sessions) * 100) / 100 : 0;

  const trendMap = new Map<string, TrendPoint>();
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = dateKey(cursor);
    trendMap.set(key, { date: key, visitors: 0, sessions: 0, pageViews: 0, events: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const row of trendRows) {
    trendMap.set(row.date, {
      date: row.date,
      visitors: toNumber(row.visitors),
      sessions: toNumber(row.sessions),
      pageViews: toNumber(row.pageViews),
      events: trendMap.get(row.date)?.events || 0,
    });
  }

  for (const row of eventTrendRows) {
    const existing = trendMap.get(row.date) || { date: row.date, visitors: 0, sessions: 0, pageViews: 0, events: 0 };
    existing.events = toNumber(row.events);
    trendMap.set(row.date, existing);
  }

  const totalDeviceUsers = deviceRows.reduce((sum, row) => sum + toNumber(row.users), 0);

  const topPages: TopPage[] = topPagesRows.map((row) => ({
    path: row.path,
    title: row.title || row.path,
    views: toNumber(row.views),
    users: toNumber(row.users),
  }));

  const trafficSources: TrafficSource[] = sourceRows.map((row) => ({
    source: row.source || "direct",
    medium: row.medium || "none",
    sessions: toNumber(row.sessions),
    users: toNumber(row.users),
  }));

  const countries: CountryData[] = countryRows.map((row) => ({
    country: row.country || "Unknown",
    users: toNumber(row.users),
    sessions: toNumber(row.sessions),
    pageViews: toNumber(row.pageViews),
  }));

  const devices: DeviceCategory[] = deviceRows.map((row) => {
    const users = toNumber(row.users);
    return {
      category: row.category || "unknown",
      users,
      sessions: toNumber(row.sessions),
      percentage: totalDeviceUsers > 0 ? Math.round((users / totalDeviceUsers) * 1000) / 10 : 0,
    };
  });

  const browsers: BrowserData[] = browserRows.map((row) => ({
    browser: row.browser || "Other",
    users: toNumber(row.users),
    sessions: toNumber(row.sessions),
  }));

  const topEvents: TopEvent[] = topEventRows.map((row) => ({
    name: row.name,
    category: row.category || "general",
    count: toNumber(row.count),
  }));

  const webVitals: WebVitalMetric[] = webVitalRows.map((row) => ({
    name: row.name,
    average: Math.round(toNumber(row.average) * 100) / 100,
    p75: Math.round(toNumber(row.p75) * 100) / 100,
    count: toNumber(row.count),
    good: toNumber(row.good),
    needsImprovement: toNumber(row.needsImprovement),
    poor: toNumber(row.poor),
  }));

  return {
    kpis: {
      visitors,
      activeVisitors,
      sessions,
      pageViews,
      eventCount,
      avgSessionDuration,
      bounceRate,
      newVisitors,
      returningVisitors: Math.max(visitors - newVisitors, 0),
      pagesPerSession,
    },
    trend: Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    topPages,
    trafficSources,
    countries,
    devices,
    browsers,
    topEvents,
    webVitals,
    summary: {
      topPage: topPages[0]?.path || "No data",
      topCountry: countries[0]?.country || "No data",
      topDevice: devices[0]?.category || "No data",
      topSource: trafficSources[0] ? `${trafficSources[0].source} / ${trafficSources[0].medium}` : "No data",
    },
    dateRange: {
      start: isoDay(start),
      end: isoDay(end),
    },
  };
}
