"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Clock,
  Eye,
  Gauge,
  Globe,
  Laptop,
  Loader2,
  Monitor,
  MousePointerClick,
  PieChart,
  RefreshCcw,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";

interface AnalyticsKPI {
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

interface TrendPoint {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
  events: number;
}

interface TopPage {
  path: string;
  title: string;
  views: number;
  users: number;
}

interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

interface CountryData {
  country: string;
  users: number;
  sessions: number;
  pageViews: number;
}

interface DeviceCategory {
  category: string;
  users: number;
  sessions: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  users: number;
  sessions: number;
}

interface TopEvent {
  name: string;
  category: string;
  count: number;
}

interface WebVitalMetric {
  name: string;
  average: number;
  p75: number;
  count: number;
  good: number;
  needsImprovement: number;
  poor: number;
}

interface AnalyticsData {
  kpis: AnalyticsKPI;
  trend: TrendPoint[];
  topPages: TopPage[];
  trafficSources: TrafficSource[];
  countries: CountryData[];
  devices: DeviceCategory[];
  browsers: BrowserData[];
  topEvents: TopEvent[];
  webVitals: WebVitalMetric[];
  summary: {
    topPage: string;
    topCountry: string;
    topDevice: string;
    topSource: string;
  };
  dateRange: { start: string; end: string };
}

type DateRange = 7 | 30 | 90 | 365;
type TrendMetric = "visitors" | "sessions" | "pageViews" | "events";

const COLORS = {
  amber: "#e8a44a",
  teal: "#4ecdc4",
  violet: "#8b5cf6",
  green: "#22c55e",
  rose: "#f43f5e",
  sky: "#38bdf8",
  orange: "#f97316",
};

const DEVICE_ICONS: Record<string, ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const DEVICE_COLORS: Record<string, string> = {
  desktop: COLORS.amber,
  mobile: COLORS.teal,
  tablet: COLORS.violet,
  unknown: "rgba(255,255,255,0.35)",
};

function fmt(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function fmtDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

function fmtDate(value: string) {
  if (value.length !== 8) return value;
  return `${value.slice(4, 6)}/${value.slice(6, 8)}`;
}

function fmtDateRange(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function Panel({
  title,
  icon: Icon,
  children,
  aside,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderColor: "rgba(255,255,255,0.07)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
      }}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border"
            style={{
              background: "rgba(232,164,74,0.1)",
              borderColor: "rgba(232,164,74,0.16)",
            }}
          >
            <Icon className="h-4 w-4 text-[#e8a44a]" />
          </div>
          <h2 className="text-sm font-bold text-white/80">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  caption,
}: {
  label: string;
  value: string;
  icon: ElementType;
  color: string;
  caption?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
        borderColor: "rgba(255,255,255,0.075)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.15)",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border"
          style={{ background: `${color}18`, borderColor: `${color}26` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        {caption ? <span className="text-xs text-white/35">{caption}</span> : null}
      </div>
      <div className="text-2xl font-extrabold text-white/90 sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-semibold text-white/42">{label}</div>
    </div>
  );
}

function HorizontalBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.055]">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percentage}%`, background: color }}
      />
    </div>
  );
}

function RowBar({
  label,
  detail,
  value,
  max,
  color,
}: {
  label: string;
  detail: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white/72" title={label}>
            {label}
          </div>
          <div className="truncate text-xs text-white/32">{detail}</div>
        </div>
        <div className="shrink-0 text-sm font-bold text-white/82">{fmt(value)}</div>
      </div>
      <HorizontalBar value={value} max={max} color={color} />
    </div>
  );
}

function TrendChart({
  data,
  metric,
  color,
}: {
  data: TrendPoint[];
  metric: TrendMetric;
  color: string;
}) {
  if (!data.length) {
    return <div className="py-16 text-center text-sm text-white/35">No trend data yet.</div>;
  }

  const width = 100;
  const height = 220;
  const paddingX = 4;
  const paddingY = 14;
  const values = data.map((point) => point[metric]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = values.map((value, index) => {
    const x = paddingX + (index / Math.max(values.length - 1, 1)) * innerWidth;
    const y = paddingY + innerHeight - ((value - min) / range) * innerHeight;
    return { x, y, value, date: data[index].date };
  });

  const path = `M ${points.map((point) => `${point.x},${point.y}`).join(" L ")}`;
  const areaPath = `${path} L ${paddingX + innerWidth},${paddingY + innerHeight} L ${paddingX},${paddingY + innerHeight} Z`;
  const gradientId = `analytics-${metric}`;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-white/36">
        <span>{fmt(max)}</span>
        <span>{fmt(Math.round((max + min) / 2))}</span>
        <span>{fmt(min)}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-[220px] w-full overflow-visible"
        role="img"
        aria-label={`${metric} trend`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.24" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((line) => (
          <line
            key={line}
            x1={paddingX}
            x2={paddingX + innerWidth}
            y1={paddingY + line * innerHeight}
            y2={paddingY + line * innerHeight}
            stroke="rgba(255,255,255,0.055)"
            strokeWidth="0.35"
          />
        ))}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.9"
        />
        {points.map((point, index) => (
          <circle key={`${point.date}-${index}`} cx={point.x} cy={point.y} r="0.75" fill={color} opacity="0.78">
            <title>{`${fmtDate(point.date)}: ${fmt(point.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-white/32">
        <span>{fmtDate(data[0].date)}</span>
        <span>{fmtDate(data[Math.floor(data.length / 2)]?.date || data[0].date)}</span>
        <span>{fmtDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

function DeviceDonut({ devices }: { devices: DeviceCategory[] }) {
  const total = devices.reduce((sum, device) => sum + device.users, 0);
  if (!total) return <div className="py-10 text-center text-sm text-white/35">No device data yet.</div>;

  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const segments = devices.map((device, index) => {
    const previousShare = devices
      .slice(0, index)
      .reduce((sum, item) => sum + item.users / total, 0);
    const share = device.users / total;
    const color = DEVICE_COLORS[device.category.toLowerCase()] || DEVICE_COLORS.unknown;

    return {
      category: device.category,
      color,
      dash: share * circumference,
      dashOffset: -previousShare * circumference,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <svg width="124" height="124" viewBox="0 0 100 100" aria-label="Device distribution">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        {segments.map((segment) => (
          <circle
            key={segment.category}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
            strokeDashoffset={segment.dashOffset}
            strokeLinecap="round"
            strokeWidth="9"
          />
        ))}
        <text x="50" y="48" fill="rgba(255,255,255,0.88)" textAnchor="middle" fontSize="12" fontWeight="800">
          {fmt(total)}
        </text>
        <text x="50" y="61" fill="rgba(255,255,255,0.38)" textAnchor="middle" fontSize="7">
          users
        </text>
      </svg>

      <div className="w-full max-w-xs space-y-3">
        {devices.map((device) => {
          const Icon = DEVICE_ICONS[device.category.toLowerCase()] || Laptop;
          const color = DEVICE_COLORS[device.category.toLowerCase()] || DEVICE_COLORS.unknown;

          return (
            <div key={device.category} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <Icon className="h-4 w-4 text-white/42" />
              <span className="flex-1 text-sm font-semibold text-white/68">{titleCase(device.category)}</span>
              <span className="text-sm font-bold text-white/84">{device.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VitalRow({ vital }: { vital: WebVitalMetric }) {
  const total = Math.max(vital.good + vital.needsImprovement + vital.poor, 1);
  const good = (vital.good / total) * 100;
  const needsImprovement = (vital.needsImprovement / total) * 100;
  const poor = (vital.poor / total) * 100;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white/82">{vital.name}</div>
          <div className="text-xs text-white/36">
            Avg {Math.round(vital.average)} ms - P75 {Math.round(vital.p75)} ms
          </div>
        </div>
        <div className="text-right text-xs text-white/42">
          <span className="block text-sm font-bold text-white/78">{fmt(vital.count)}</span>
          samples
        </div>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div style={{ width: `${good}%`, background: COLORS.green }} />
        <div style={{ width: `${needsImprovement}%`, background: COLORS.orange }} />
        <div style={{ width: `${poor}%`, background: COLORS.rose }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-white/35">
        <span>{vital.good} good</span>
        <span>{vital.needsImprovement} needs work</span>
        <span>{vital.poor} poor</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl border p-8 text-center"
      style={{
        background: "linear-gradient(135deg, rgba(232,164,74,0.08), rgba(78,205,196,0.045))",
        borderColor: "rgba(232,164,74,0.14)",
      }}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e8a44a]/20 bg-[#e8a44a]/10">
        <BarChart3 className="h-5 w-5 text-[#e8a44a]" />
      </div>
      <h2 className="text-lg font-bold text-white/86">Waiting for real traffic</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/48">
        Prisma analytics is active. This view will populate as visitors browse public pages.
      </p>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<DateRange>(30);
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("visitors");

  const fetchData = useCallback(async (rangeDays: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics?days=${rangeDays}`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || `HTTP ${response.status}`);
      }
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(days);
  }, [days, fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#e8a44a]" />
        <p className="text-sm text-white/35">Loading Prisma analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/15 bg-red-500/10">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="text-lg font-bold text-white/84">Analytics unavailable</h1>
        <p className="max-w-md text-center text-sm text-white/42">{error || "Unable to load analytics data."}</p>
        <button
          type="button"
          onClick={() => fetchData(days)}
          className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const kpi = data.kpis;
  const hasTraffic = kpi.pageViews > 0 || kpi.visitors > 0;
  const topPageMax = data.topPages[0]?.views || 1;
  const sourceMax = data.trafficSources[0]?.sessions || 1;
  const countryMax = data.countries[0]?.users || 1;
  const browserMax = data.browsers[0]?.users || 1;
  const eventMax = data.topEvents[0]?.count || 1;
  const trendColors: Record<TrendMetric, string> = {
    visitors: COLORS.amber,
    sessions: COLORS.teal,
    pageViews: COLORS.violet,
    events: COLORS.green,
  };

  const metrics = [
    { label: "Visitors", value: fmt(kpi.visitors), icon: Users, color: COLORS.amber },
    { label: "Active now", value: fmt(kpi.activeVisitors), icon: Activity, color: COLORS.green, caption: "15 min" },
    { label: "Sessions", value: fmt(kpi.sessions), icon: TrendingUp, color: COLORS.teal },
    { label: "Page views", value: fmt(kpi.pageViews), icon: Eye, color: COLORS.violet },
    { label: "Events", value: fmt(kpi.eventCount), icon: MousePointerClick, color: COLORS.sky },
    { label: "Avg session", value: fmtDuration(kpi.avgSessionDuration), icon: Clock, color: COLORS.rose },
    { label: "Bounce rate", value: `${kpi.bounceRate}%`, icon: ArrowDownRight, color: COLORS.orange },
    { label: "Pages/session", value: kpi.pagesPerSession.toFixed(2), icon: Gauge, color: COLORS.green },
    { label: "New visitors", value: fmt(kpi.newVisitors), icon: ArrowUpRight, color: COLORS.teal },
    { label: "Returning", value: fmt(kpi.returningVisitors), icon: Users, color: COLORS.violet },
  ];

  const summaryItems = [
    { label: "Top page", value: data.summary.topPage, icon: Eye, color: COLORS.amber },
    { label: "Top country", value: data.summary.topCountry, icon: Globe, color: COLORS.teal },
    { label: "Top device", value: titleCase(data.summary.topDevice), icon: Monitor, color: COLORS.violet },
    { label: "Top source", value: data.summary.topSource, icon: PieChart, color: COLORS.green },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e8a44a]/15 bg-[#e8a44a]/10 px-3 py-1 text-xs font-semibold text-[#e8a44a]">
            <BarChart3 className="h-3.5 w-3.5" />
            First-party Prisma analytics
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-white/92">
            Analytics <span className="font-semibold text-white/28">Overview</span>
          </h1>
          <p className="mt-1 text-sm text-white/38">
            {fmtDateRange(data.dateRange.start)} to {fmtDateRange(data.dateRange.end)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchData(days)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-semibold text-white/58 transition hover:bg-white/[0.07] hover:text-white/82"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <div className="flex overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035]">
            {([7, 30, 90, 365] as DateRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                className={`inline-flex h-10 min-w-16 items-center justify-center gap-1.5 px-3 text-sm font-bold transition ${
                  days === range
                    ? "bg-[#e8a44a]/12 text-[#e8a44a]"
                    : "text-white/38 hover:bg-white/[0.04] hover:text-white/68"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {range === 365 ? "1Y" : `${range}D`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasTraffic ? <EmptyState /> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex min-h-24 items-center gap-3 rounded-2xl border p-4"
              style={{
                background: "rgba(255,255,255,0.025)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                style={{ background: `${item.color}14`, borderColor: `${item.color}22` }}
              >
                <Icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white/35">{item.label}</div>
                <div className="truncate text-sm font-bold text-white/78" title={item.value}>
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Panel
        title="Traffic trend"
        icon={TrendingUp}
        aside={
          <div className="flex flex-wrap gap-1">
            {(["visitors", "sessions", "pageViews", "events"] as TrendMetric[]).map((metric) => (
              <button
                key={metric}
                type="button"
                onClick={() => setTrendMetric(metric)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  trendMetric === metric
                    ? "bg-white/[0.08] text-white/86"
                    : "text-white/35 hover:bg-white/[0.045] hover:text-white/62"
                }`}
              >
                {metric === "pageViews" ? "Page views" : titleCase(metric)}
              </button>
            ))}
          </div>
        }
      >
        <TrendChart data={data.trend} metric={trendMetric} color={trendColors[trendMetric]} />
      </Panel>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Top pages" icon={Eye}>
          <div className="space-y-4">
            {data.topPages.length ? (
              data.topPages.map((page) => (
                <RowBar
                  key={page.path}
                  label={page.path}
                  detail={`${fmt(page.users)} visitors`}
                  value={page.views}
                  max={topPageMax}
                  color={COLORS.amber}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-white/35">No page views yet.</p>
            )}
          </div>
        </Panel>

        <Panel title="Traffic sources" icon={PieChart}>
          <div className="space-y-4">
            {data.trafficSources.length ? (
              data.trafficSources.map((source) => (
                <RowBar
                  key={`${source.source}-${source.medium}`}
                  label={`${source.source} / ${source.medium}`}
                  detail={`${fmt(source.users)} visitors`}
                  value={source.sessions}
                  max={sourceMax}
                  color={COLORS.teal}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-white/35">No source data yet.</p>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Countries" icon={Globe}>
          <div className="space-y-4">
            {data.countries.length ? (
              data.countries.map((country) => (
                <RowBar
                  key={country.country}
                  label={country.country}
                  detail={`${fmt(country.sessions)} sessions - ${fmt(country.pageViews)} views`}
                  value={country.users}
                  max={countryMax}
                  color={COLORS.violet}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-white/35">No country data yet.</p>
            )}
          </div>
        </Panel>

        <Panel title="Devices" icon={Monitor}>
          <DeviceDonut devices={data.devices} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel title="Browsers" icon={Laptop}>
          <div className="space-y-4">
            {data.browsers.length ? (
              data.browsers.map((browser) => (
                <RowBar
                  key={browser.browser}
                  label={browser.browser}
                  detail={`${fmt(browser.sessions)} sessions`}
                  value={browser.users}
                  max={browserMax}
                  color={COLORS.sky}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-white/35">No browser data yet.</p>
            )}
          </div>
        </Panel>

        <Panel title="Top events" icon={MousePointerClick}>
          <div className="space-y-4">
            {data.topEvents.length ? (
              data.topEvents.map((event) => (
                <RowBar
                  key={`${event.category}-${event.name}`}
                  label={titleCase(event.name)}
                  detail={titleCase(event.category)}
                  value={event.count}
                  max={eventMax}
                  color={COLORS.green}
                />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-white/35">No custom events yet.</p>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Web Vitals" icon={Gauge}>
        {data.webVitals.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {data.webVitals.map((vital) => (
              <VitalRow key={vital.name} vital={vital} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-white/35">No Web Vitals samples yet.</p>
        )}
      </Panel>
    </div>
  );
}
