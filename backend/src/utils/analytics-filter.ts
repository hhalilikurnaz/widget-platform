import type {
  AnalyticsDevice,
  AnalyticsFilters,
  AnalyticsSource,
  AnalyticsTimelineFilters,
} from '../types/analytics.types.js';

const DEFAULT_RANGE_DAYS = 30;

const ORGANIC_DOMAINS = [
  'google.',
  'bing.',
  'yahoo.',
  'duckduckgo.',
  'baidu.',
  'yandex.',
  'ecosia.',
];

export function resolveAnalyticsDateRange(dateFrom?: Date, dateTo?: Date): { dateFrom: Date; dateTo: Date } {
  const end = dateTo ?? new Date();
  const start =
    dateFrom ?? new Date(end.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000);

  return { dateFrom: start, dateTo: end };
}

export function buildAnalyticsFilters(
  workspaceId: string,
  widgetId: string,
  query: {
    dateFrom?: Date;
    dateTo?: Date;
    version?: number;
    country?: string;
    browser?: string;
    device?: AnalyticsDevice;
    source?: AnalyticsSource;
    granularity?: AnalyticsTimelineFilters['granularity'];
  },
): AnalyticsFilters {
  const range = resolveAnalyticsDateRange(query.dateFrom, query.dateTo);

  return {
    workspaceId,
    widgetId,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    version: query.version,
    country: query.country,
    browser: query.browser,
    device: query.device,
    source: query.source,
  };
}

export function buildAnalyticsTimelineFilters(
  workspaceId: string,
  widgetId: string,
  query: {
    dateFrom?: Date;
    dateTo?: Date;
    version?: number;
    country?: string;
    browser?: string;
    device?: AnalyticsDevice;
    source?: AnalyticsSource;
    granularity: AnalyticsTimelineFilters['granularity'];
  },
): AnalyticsTimelineFilters {
  return {
    ...buildAnalyticsFilters(workspaceId, widgetId, query),
    granularity: query.granularity,
  };
}

export function classifyTrafficSource(input: {
  referrer?: string;
  pageUrl?: string;
  source?: string;
}): AnalyticsSource {
  if (input.source === 'direct' || input.source === 'organic' || input.source === 'referral' || input.source === 'campaign') {
    return input.source;
  }

  const referrer = input.referrer?.trim() ?? '';
  const pageUrl = input.pageUrl ?? '';

  if (pageUrl.includes('utm_campaign=') || pageUrl.includes('utm_source=')) {
    return 'campaign';
  }

  if (referrer.length === 0) {
    return 'direct';
  }

  const lowerReferrer = referrer.toLowerCase();
  if (ORGANIC_DOMAINS.some((domain) => lowerReferrer.includes(domain))) {
    return 'organic';
  }

  return 'referral';
}

export function normalizeBrowserName(browser?: string): 'chrome' | 'safari' | 'firefox' | 'edge' | 'other' {
  const value = browser?.toLowerCase() ?? '';

  if (value.includes('chrome') && !value.includes('edge')) {
    return 'chrome';
  }

  if (value.includes('safari') && !value.includes('chrome')) {
    return 'safari';
  }

  if (value.includes('firefox')) {
    return 'firefox';
  }

  if (value.includes('edge')) {
    return 'edge';
  }

  return 'other';
}

export function normalizeDeviceName(device?: string): AnalyticsDevice | 'unknown' {
  if (device === 'desktop' || device === 'tablet' || device === 'mobile') {
    return device;
  }

  return 'unknown';
}

export interface AnalyticsSqlFilterParams {
  country: string | null;
  browser: string | null;
  device: string | null;
  widgetVersionId: string | null;
  source: AnalyticsSource | null;
}

export function toSqlFilterParams(
  filters: AnalyticsFilters,
  widgetVersionId?: string | null,
): AnalyticsSqlFilterParams {
  return {
    country: filters.country ?? null,
    browser: filters.browser ?? null,
    device: filters.device ?? null,
    widgetVersionId: widgetVersionId ?? null,
    source: filters.source ?? null,
  };
}
