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
  BarChart3,
  Calendar,
  Clock,
  Eye,
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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

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
  blurple: "#5865F2",
  green: "#23a559",
  red: "#da373c",
  yellow: "#fee75c",
  pink: "#eb459e",
  teal: "#00b0f4",
  orange: "#f47b67"
};

const DEVICE_COLORS = [COLORS.blurple, COLORS.green, COLORS.yellow, COLORS.teal, COLORS.pink];

const COUNTRY_ISO: Record<string, string> = {
  "United States": "us", "Spain": "es", "Mexico": "mx", "Argentina": "ar",
  "Colombia": "co", "Chile": "cl", "Peru": "pe", "Venezuela": "ve",
  "Ecuador": "ec", "Guatemala": "gt", "Cuba": "cu", "Bolivia": "bo",
  "Dominican Republic": "do", "Honduras": "hn", "Paraguay": "py",
  "El Salvador": "sv", "Nicaragua": "ni", "Costa Rica": "cr",
  "Puerto Rico": "pr", "Panama": "pa", "Uruguay": "uy", "Brazil": "br",
  "United Kingdom": "gb", "Canada": "ca", "Germany": "de", "France": "fr",
  "Italy": "it", "Japan": "jp", "China": "cn", "India": "in",
  "Australia": "au", "Russia": "ru", "South Korea": "kr", "Portugal": "pt",
  "Netherlands": "nl", "Sweden": "se", "Norway": "no", "Denmark": "dk",
  "Finland": "fi", "Poland": "pl", "Turkey": "tr", "Indonesia": "id",
  "Philippines": "ph", "Thailand": "th", "Vietnam": "vn", "Malaysia": "my",
  "Singapore": "sg", "New Zealand": "nz", "Ireland": "ie", "Switzerland": "ch",
  "Austria": "at", "Belgium": "be", "Czech Republic": "cz", "Romania": "ro",
  "Ukraine": "ua", "Israel": "il", "South Africa": "za", "Egypt": "eg",
  "Nigeria": "ng", "Kenya": "ke", "Morocco": "ma", "Saudi Arabia": "sa",
  "United Arab Emirates": "ae",
};

function getCountryCode(countryName: string) {
  return COUNTRY_ISO[countryName] || "";
}

function getFlagUrl(countryName: string) {
  const code = getCountryCode(countryName);
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
}

const BROWSER_COLORS: Record<string, string> = {
  "Chrome": "#4285F4",
  "Firefox": "#FF7139",
  "Safari": "#006CFF",
  "Edge": "#0078D7",
  "Opera": "#FF1B2D",
  "Samsung Internet": "#1428A0",
  "Other": "#949ba4",
};

function getBrowserColor(browser: string) {
  return BROWSER_COLORS[browser] || COLORS.teal;
}

function getVitalRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    TTFB: [800, 1800],
    INP: [200, 500],
    FCP: [1800, 3000],
  };
  const t = thresholds[name];
  if (!t) return "good";
  if (value <= t[0]) return "good";
  if (value <= t[1]) return "needs-improvement";
  return "poor";
}

function fmtVitalValue(name: string, value: number) {
  if (name === "CLS") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

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

function fmtDateLong(value: string) {
  if (value.length !== 8) return value;
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDateRange(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "numeric",
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#3f4147] bg-[#1e1f22] p-3 text-sm shadow-xl">
        <div className="mb-2 font-bold text-[#dbdee1]">{fmtDateLong(label)}</div>
        <div className="space-y-1.5">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[#949ba4] font-medium">{titleCase(p.name)}</span>
              </div>
              <span className="font-bold text-[#dbdee1]">{fmt(p.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function MetricCard({
  label,
  value,
  trend,
  trendPositive
}: {
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl bg-[#2b2d31] p-5 shadow-sm transition-colors hover:bg-[#313338]">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4]">{label}</div>
      <div className="mt-3 text-3xl font-bold text-[#dbdee1]">{value}</div>
      {trend && (
        <div className={`mt-2 flex items-center text-xs font-semibold ${trendPositive ? 'text-[#23a559]' : 'text-[#da373c]'}`}>
          <span className="mr-1">{trendPositive ? '▲' : '▼'}</span>
          <span>{trend}</span>
          <span className="ml-1 text-[#949ba4]">compared to last period</span>
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl bg-[#2b2d31] p-6 shadow-sm overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#dbdee1]">{title}</h2>
        {aside}
      </div>
      <div className="flex-1 w-full min-h-0">{children}</div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl bg-[#2b2d31] p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e1f22]">
        <BarChart3 className="h-6 w-6 text-[#949ba4]" />
      </div>
      <h2 className="text-lg font-bold text-[#dbdee1]">Waiting for real traffic</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[#949ba4]">
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#313338] rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#5865F2]" />
        <p className="text-sm font-medium text-[#949ba4]">Loading insights...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#313338] rounded-xl p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#da373c]/10">
          <AlertCircle className="h-8 w-8 text-[#da373c]" />
        </div>
        <h1 className="text-xl font-bold text-[#dbdee1]">Analytics Unavailable</h1>
        <p className="max-w-md text-sm text-[#949ba4]">{error || "Unable to load analytics data."}</p>
        <button
          type="button"
          onClick={() => fetchData(days)}
          className="mt-4 inline-flex items-center gap-2 rounded bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4752c4]"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const kpi = data.kpis;
  const hasTraffic = kpi.pageViews > 0 || kpi.visitors > 0;
  
  // Format trend data for Recharts
  const chartData = data.trend.map(p => ({
    ...p,
    name: p.date, // Use 'name' for XAxis
  }));

  const trendColors: Record<TrendMetric, string> = {
    visitors: COLORS.blurple,
    sessions: COLORS.green,
    pageViews: COLORS.pink,
    events: COLORS.yellow,
  };

  const topPagesData = data.topPages.slice(0, 5);
  const trafficSourcesData = data.trafficSources.slice(0, 5).map(s => ({
    name: `${s.source}`,
    sessions: s.sessions,
    users: s.users
  }));

  const countriesData = data.countries.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#313338] rounded-2xl p-6 md:p-8 space-y-8 font-sans">
      {/* Header Area styled like Discord's Server Insights */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-[#3f4147] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#dbdee1]">
            Growth & Activation
          </h1>
          <p className="mt-1 text-sm text-[#949ba4]">
            Data from the last {days} days. Users who opted out of analytics tracking will not show up in the data.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#949ba4] uppercase">Interval</label>
            <div className="flex h-10 items-center justify-between rounded bg-[#1e1f22] px-3 border border-[#1e1f22] text-sm text-[#dbdee1] min-w-[140px] shadow-sm">
              <span>Daily</span>
              <ChevronDownIcon />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#949ba4] uppercase">Date Range</label>
            <div className="flex h-10 items-center justify-between gap-3 rounded bg-[#1e1f22] px-3 border border-[#1e1f22] text-sm text-[#dbdee1] min-w-[200px] shadow-sm">
              <span>{fmtDateRange(data.dateRange.start)} - {fmtDateRange(data.dateRange.end)}</span>
              <Calendar className="h-4 w-4 text-[#949ba4]" />
            </div>
          </div>

          <div className="flex overflow-hidden rounded bg-[#1e1f22] border border-[#1e1f22] mt-1 lg:mt-0 h-10 shadow-sm">
            {([7, 30, 90, 365] as DateRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                className={`px-3 text-sm font-medium transition ${
                  days === range
                    ? "bg-[#3f4147] text-[#dbdee1]"
                    : "text-[#949ba4] hover:bg-[#2b2d31] hover:text-[#dbdee1]"
                }`}
              >
                {range === 365 ? "1Y" : `${range}D`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasTraffic ? <EmptyState /> : null}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Visitors" value={fmt(kpi.visitors)} />
        <MetricCard label="Active Sessions" value={fmt(kpi.sessions)} />
        <MetricCard label="Page Views" value={fmt(kpi.pageViews)} />
        <MetricCard label="Bounce Rate" value={`${kpi.bounceRate}%`} />
      </div>

      {/* Interactive Trend Chart */}
      <Panel
        title="Traffic over time"
        aside={
          <div className="flex flex-wrap gap-2">
            {(["visitors", "sessions", "pageViews", "events"] as TrendMetric[]).map((metric) => (
              <button
                key={metric}
                type="button"
                onClick={() => setTrendMetric(metric)}
                className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                  trendMetric === metric
                    ? "bg-[#3f4147] text-[#dbdee1]"
                    : "text-[#949ba4] hover:bg-[#3f4147]/50 hover:text-[#dbdee1]"
                }`}
              >
                {metric === "pageViews" ? "Page Views" : titleCase(metric)}
              </button>
            ))}
          </div>
        }
      >
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${trendMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={trendColors[trendMetric]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={trendColors[trendMetric]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f4147" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={fmtDateLong}
                tick={{ fill: '#949ba4', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={fmt}
                tick={{ fill: '#949ba4', fontSize: 12 }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#ffffff', strokeWidth: 1.5, strokeDasharray: '4 4' }} 
              />
              <Area 
                type="monotone" 
                dataKey={trendMetric} 
                stroke={trendColors[trendMetric]} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#color-${trendMetric})`} 
                activeDot={{ r: 6, fill: trendColors[trendMetric], stroke: '#1e1f22', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Panel title="Top Pages">
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPagesData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#3f4147" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="path" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#dbdee1', fontSize: 12 }}
                  width={150}
                />
                <Tooltip 
                  cursor={{ fill: '#3f4147', opacity: 0.4 }} 
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#3f4147', color: '#dbdee1', borderRadius: '8px' }}
                  itemStyle={{ color: '#dbdee1', fontWeight: 'bold' }}
                />
                <Bar dataKey="views" fill={COLORS.blurple} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Traffic Sources */}
        <Panel title="Traffic Sources">
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficSourcesData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f4147" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#949ba4', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={fmt}
                  tick={{ fill: '#949ba4', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#3f4147', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#3f4147', color: '#dbdee1', borderRadius: '8px' }}
                />
                <Bar dataKey="sessions" fill={COLORS.green} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Countries with Real Flags */}
        <Panel title="Top Countries">
          <div className="mt-4 space-y-3">
            {countriesData.length > 0 ? countriesData.map((c, i) => {
              const maxUsers = countriesData[0]?.users || 1;
              const pct = Math.round((c.users / maxUsers) * 100);
              const flagSrc = getFlagUrl(c.country);
              return (
                <div key={c.country} className="group">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-sm font-bold text-[#949ba4] w-5 text-right">{i + 1}</span>
                    {flagSrc ? (
                      <img
                        src={flagSrc}
                        alt={`${c.country} flag`}
                        width={24}
                        height={16}
                        className="rounded-[3px] object-cover shadow-sm"
                        style={{ minWidth: 24 }}
                      />
                    ) : (
                      <Globe className="h-4 w-4 text-[#949ba4]" style={{ minWidth: 24 }} />
                    )}
                    <span className="text-sm font-semibold text-[#dbdee1] flex-1 truncate">{c.country}</span>
                    <span className="text-sm font-bold text-[#dbdee1] tabular-nums">{fmt(c.users)}</span>
                    <span className="text-[10px] font-medium text-[#949ba4] w-10 text-right">{fmt(c.sessions)} ses</span>
                  </div>
                  <div className="ml-8 h-1.5 rounded-full bg-[#1e1f22] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.blurple})`,
                      }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-[#949ba4] text-center py-8">No country data yet.</p>
            )}
          </div>
        </Panel>

        {/* Devices Donut */}
        <Panel title="Devices">
           <div className="flex h-[250px] w-full mt-4 items-center justify-center">
             {data.devices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="users"
                      nameKey="category"
                      stroke="none"
                    >
                      {data.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#3f4147', color: '#dbdee1', borderRadius: '8px' }}
                      itemStyle={{ color: '#dbdee1', fontWeight: 'bold' }}
                      formatter={(value: any, name: any) => [fmt(Number(value) || 0), titleCase(String(name))]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-[#dbdee1]">{titleCase(value)}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
             ) : (
                <p className="text-sm text-[#949ba4]">No device data yet.</p>
             )}
           </div>
        </Panel>

        {/* Other Metrics Summary */}
        <Panel title="Additional Metrics">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl bg-[#1e1f22] p-4 flex flex-col justify-center shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-[#949ba4] mb-1">Avg Session Duration</div>
              <div className="text-xl font-bold text-[#dbdee1] flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#5865F2]" />
                {fmtDuration(kpi.avgSessionDuration)}
              </div>
            </div>
            <div className="rounded-xl bg-[#1e1f22] p-4 flex flex-col justify-center shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-[#949ba4] mb-1">Pages Per Session</div>
              <div className="text-xl font-bold text-[#dbdee1] flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#23a559]" />
                {kpi.pagesPerSession.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl bg-[#1e1f22] p-4 flex flex-col justify-center shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-[#949ba4] mb-1">New Visitors</div>
              <div className="text-xl font-bold text-[#dbdee1] flex items-center gap-2">
                <Users className="h-5 w-5" style={{ color: COLORS.pink }}/>
                {fmt(kpi.newVisitors)}
              </div>
            </div>
            <div className="rounded-xl bg-[#1e1f22] p-4 flex flex-col justify-center shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-[#949ba4] mb-1">Total Events</div>
              <div className="text-xl font-bold text-[#dbdee1] flex items-center gap-2">
                <Activity className="h-5 w-5" style={{ color: COLORS.yellow }}/>
                {fmt(kpi.eventCount)}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Browsers & Top Events Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Browsers */}
        <Panel title="Browsers">
          <div className="mt-4 space-y-3">
            {data.browsers.length > 0 ? data.browsers.slice(0, 6).map((b, i) => {
              const maxUsers = data.browsers[0]?.users || 1;
              const pct = Math.round((b.users / maxUsers) * 100);
              const color = getBrowserColor(b.browser);
              return (
                <div key={b.browser}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-sm font-bold text-[#949ba4] w-5 text-right">{i + 1}</span>
                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm font-semibold text-[#dbdee1] flex-1 truncate">{b.browser}</span>
                    <span className="text-sm font-bold text-[#dbdee1] tabular-nums">{fmt(b.users)} users</span>
                    <span className="text-[10px] font-medium text-[#949ba4] w-12 text-right">{fmt(b.sessions)} ses</span>
                  </div>
                  <div className="ml-8 h-1.5 rounded-full bg-[#1e1f22] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-sm text-[#949ba4] text-center py-8">No browser data yet.</p>
            )}
          </div>
        </Panel>

        {/* Top Events */}
        <Panel title="Top Events">
          <div className="mt-4">
            {data.topEvents.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_100px_80px] gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#949ba4]">
                  <span>Event</span>
                  <span>Category</span>
                  <span className="text-right">Count</span>
                </div>
                {data.topEvents.slice(0, 8).map((ev, i) => (
                  <div
                    key={`${ev.name}-${ev.category}`}
                    className="grid grid-cols-[1fr_100px_80px] gap-2 items-center rounded-lg px-3 py-2.5 transition-colors hover:bg-[#1e1f22]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MousePointerClick className="h-3.5 w-3.5 text-[#5865F2] flex-shrink-0" />
                      <span className="text-sm font-semibold text-[#dbdee1] truncate">{titleCase(ev.name)}</span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-[#1e1f22] px-2 py-0.5 text-[10px] font-bold text-[#949ba4] uppercase truncate">
                      {ev.category}
                    </span>
                    <span className="text-sm font-bold text-[#dbdee1] text-right tabular-nums">{fmt(ev.count)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#949ba4] text-center py-8">No events tracked yet.</p>
            )}
          </div>
        </Panel>
      </div>

      {/* Web Vitals */}
      {data.webVitals.length > 0 && (
        <Panel title="Core Web Vitals">
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.webVitals.map((vital) => {
              const rating = getVitalRating(vital.name, vital.p75);
              const ratingColor = rating === "good" ? COLORS.green : rating === "needs-improvement" ? "#f0b232" : COLORS.red;
              const total = vital.good + vital.needsImprovement + vital.poor;
              const goodPct = total > 0 ? Math.round((vital.good / total) * 100) : 0;
              const needsPct = total > 0 ? Math.round((vital.needsImprovement / total) * 100) : 0;
              const poorPct = total > 0 ? 100 - goodPct - needsPct : 0;
              return (
                <div key={vital.name} className="rounded-xl bg-[#1e1f22] p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#949ba4]">{vital.name}</span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${ratingColor}20`, color: ratingColor }}
                    >
                      {rating === "needs-improvement" ? "Needs Work" : titleCase(rating)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#dbdee1] mb-1" style={{ color: ratingColor }}>
                    {fmtVitalValue(vital.name, vital.p75)}
                  </div>
                  <div className="text-[10px] text-[#949ba4] mb-3">
                    P75 · avg {fmtVitalValue(vital.name, vital.average)} · {fmt(vital.count)} samples
                  </div>
                  <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-0.5">
                    <div className="rounded-full" style={{ width: `${goodPct}%`, backgroundColor: COLORS.green }} />
                    <div className="rounded-full" style={{ width: `${needsPct}%`, backgroundColor: "#f0b232" }} />
                    <div className="rounded-full" style={{ width: `${poorPct}%`, backgroundColor: COLORS.red }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[9px] font-bold text-[#949ba4]">
                    <span style={{ color: COLORS.green }}>{goodPct}% good</span>
                    <span style={{ color: "#f0b232" }}>{needsPct}% meh</span>
                    <span style={{ color: COLORS.red }}>{poorPct}% poor</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="#949ba4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
