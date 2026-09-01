export type AnalyticsEventType = "page_view" | "cta_click" | "resume_download" | "project_view" | "contact_click";

export type AnalyticsEventInput = {
  eventType: AnalyticsEventType;
  path?: string;
  label?: string;
  target?: string;
  referrer?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

type AnalyticsRow = {
  event_type: AnalyticsEventType | string;
  path: string | null;
  label: string | null;
  target: string | null;
  referrer: string | null;
  created_at: string;
};

export type AnalyticsSummary = {
  enabled: boolean;
  configured: boolean;
  canRead: boolean;
  table: string;
  range: string;
  totalEvents: number;
  todayEvents: number;
  pageViews: number;
  ctaClicks: number;
  resumeDownloads: number;
  contactClicks: number;
  projectViews: number;
  topPages: Array<{ path: string; count: number }>;
  topCtas: Array<{ label: string; count: number }>;
  topProjects: Array<{ path: string; count: number }>;
  recentEvents: Array<{
    eventType: string;
    path: string;
    label: string;
    createdAt: string;
  }>;
  daily: Array<{ date: string; count: number }>;
  message?: string;
};

const defaultAnalyticsTable = "portfolio_events";

export const analyticsConfig = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false",
  table: process.env.SUPABASE_ANALYTICS_TABLE || defaultAnalyticsTable,
  maxRows: Number(process.env.ANALYTICS_MAX_ROWS || 5000),
};

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
}


function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function writeKey() {
  return serviceKey();
}

function readKey() {
  return serviceKey();
}

function isConfigured() {
  return Boolean(supabaseUrl() && serviceKey());
}

function isReadConfigured() {
  return Boolean(supabaseUrl() && readKey());
}

function friendlyAnalyticsError(status: number, errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as { code?: string; message?: string; hint?: string | null };
    if (parsed.code === "PGRST205" || parsed.message?.includes("schema cache")) {
      return `Supabase analytics table '${analyticsConfig.table}' is missing. Run supabase/schema.sql in the same Supabase project, wait 30-60 seconds, then reload /admin.`;
    }
    return parsed.hint ? `${parsed.message} Hint: ${parsed.hint}` : parsed.message || errorText;
  } catch {
    if (errorText.includes("PGRST205") || errorText.includes("schema cache")) {
      return `Supabase analytics table '${analyticsConfig.table}' is missing. Run supabase/schema.sql in the same Supabase project, wait 30-60 seconds, then reload /admin.`;
    }
    return errorText || `Supabase analytics request failed with status ${status}.`;
  }
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.slice(0, 500) : fallback;
}

function cleanMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = Object.entries(value as Record<string, unknown>).slice(0, 20);
  return Object.fromEntries(
    entries.map(([key, item]) => {
      if (["string", "number", "boolean"].includes(typeof item) || item === null) {
        return [key.slice(0, 80), typeof item === "string" ? item.slice(0, 500) : item];
      }
      return [key.slice(0, 80), String(item).slice(0, 500)];
    }),
  );
}

export async function saveAnalyticsEvent(input: AnalyticsEventInput, context?: { userAgent?: string }) {
  if (!analyticsConfig.enabled) {
    return { saved: false, reason: "Analytics disabled by NEXT_PUBLIC_ENABLE_ANALYTICS=false." };
  }

  if (!isConfigured()) {
    return { saved: false, reason: "Supabase analytics is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." };
  }

  const key = writeKey();
  const payload = {
    event_type: input.eventType,
    path: cleanText(input.path, "/"),
    label: cleanText(input.label),
    target: cleanText(input.target),
    referrer: cleanText(input.referrer),
    user_agent: cleanText(context?.userAgent),
    metadata: cleanMetadata(input.metadata),
  };

  const response = await fetch(`${supabaseUrl()}/rest/v1/${analyticsConfig.table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(friendlyAnalyticsError(response.status, errorText));
  }

  return { saved: true };
}

function countBy(rows: AnalyticsRow[], selector: (row: AnalyticsRow) => string | null | undefined) {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const key = selector(row)?.trim();
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const base: AnalyticsSummary = {
    enabled: analyticsConfig.enabled,
    configured: isConfigured(),
    canRead: isReadConfigured(),
    table: analyticsConfig.table,
    range: `Last ${analyticsConfig.maxRows.toLocaleString()} events`,
    totalEvents: 0,
    todayEvents: 0,
    pageViews: 0,
    ctaClicks: 0,
    resumeDownloads: 0,
    contactClicks: 0,
    projectViews: 0,
    topPages: [],
    topCtas: [],
    topProjects: [],
    recentEvents: [],
    daily: [],
  };

  if (!analyticsConfig.enabled) {
    return { ...base, message: "Analytics is disabled. Set NEXT_PUBLIC_ENABLE_ANALYTICS=true or remove the variable." };
  }

  if (!isReadConfigured()) {
    return { ...base, message: "Analytics dashboard needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." };
  }

  const key = readKey();
  const params = new URLSearchParams({
    select: "event_type,path,label,target,referrer,created_at",
    order: "created_at.desc",
    limit: String(analyticsConfig.maxRows),
  });

  const response = await fetch(`${supabaseUrl()}/rest/v1/${analyticsConfig.table}?${params.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ...base, message: friendlyAnalyticsError(response.status, errorText) };
  }

  const rows = (await response.json()) as AnalyticsRow[];
  const today = isoDate(new Date());
  const pageRows = rows.filter((row) => row.event_type === "page_view" || row.event_type === "project_view");
  const ctaRows = rows.filter((row) => row.event_type === "cta_click" || row.event_type === "resume_download" || row.event_type === "contact_click");
  const projectRows = rows.filter((row) => (row.path || "").startsWith("/projects/"));

  const dailyMap = new Map<string, number>();
  rows.forEach((row) => {
    const date = row.created_at.slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  });

  const daily = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  return {
    ...base,
    totalEvents: rows.length,
    todayEvents: rows.filter((row) => row.created_at.startsWith(today)).length,
    pageViews: rows.filter((row) => row.event_type === "page_view").length,
    ctaClicks: rows.filter((row) => row.event_type === "cta_click").length,
    resumeDownloads: rows.filter((row) => row.event_type === "resume_download").length,
    contactClicks: rows.filter((row) => row.event_type === "contact_click").length,
    projectViews: rows.filter((row) => row.event_type === "project_view").length,
    topPages: countBy(pageRows, (row) => row.path).slice(0, 8).map((item) => ({ path: item.key, count: item.count })),
    topCtas: countBy(ctaRows, (row) => row.label || row.target).slice(0, 8).map((item) => ({ label: item.key, count: item.count })),
    topProjects: countBy(projectRows, (row) => row.path).slice(0, 6).map((item) => ({ path: item.key, count: item.count })),
    recentEvents: rows.slice(0, 12).map((row) => ({
      eventType: row.event_type,
      path: row.path || "/",
      label: row.label || row.target || "—",
      createdAt: row.created_at,
    })),
    daily,
    message: rows.length === 0 ? "No analytics events yet. Visit public pages after deploy to start collecting data." : undefined,
  };
}
