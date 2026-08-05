import type {
  AnalyticsBrowserBreakdownDto,
  AnalyticsCountryBreakdownDto,
  AnalyticsCountryBreakdownItemDto,
  AnalyticsDeviceBreakdownDto,
  AnalyticsOverviewDto,
  AnalyticsPerformanceDto,
  AnalyticsSourceBreakdownDto,
  AnalyticsTimelineDto,
  AnalyticsTimelinePointDto,
  RawBrowserRow,
  RawCountryRow,
  RawDeviceRow,
  RawOverviewCounts,
  RawPerformanceRow,
  RawSourceRow,
  RawTimelineRow,
  TimelineGranularity,
} from '../types/analytics.types.js';
import { classifyTrafficSource, normalizeBrowserName, normalizeDeviceName } from './analytics-filter.js';
import { formatTimelinePeriod } from './timeline.js';

const SLOW_REQUEST_THRESHOLD_MS = 1000;

export function calculateConversionRate(submissions: number, views: number): number {
  if (views === 0) {
    return 0;
  }

  return roundPercentage((submissions / views) * 100);
}

export function calculateCompletionRate(successes: number, starts: number): number {
  if (starts === 0) {
    return 0;
  }

  return roundPercentage((successes / starts) * 100);
}

export function calculateBounceRate(bouncedSessions: number, totalViewSessions: number): number {
  if (totalViewSessions === 0) {
    return 0;
  }

  return roundPercentage((bouncedSessions / totalViewSessions) * 100);
}

export function toAnalyticsOverview(
  counts: RawOverviewCounts,
  dateFrom: Date,
  dateTo: Date,
): AnalyticsOverviewDto {
  return {
    views: counts.views,
    uniqueVisitors: counts.uniqueVisitors,
    opens: counts.opens,
    starts: counts.starts,
    submissions: counts.submissions,
    successes: counts.successes,
    errors: counts.errors,
    conversionRate: calculateConversionRate(counts.submissions, counts.views),
    completionRate: calculateCompletionRate(counts.successes, counts.starts),
    averageCompletionTimeMs: Math.round(counts.averageCompletionTimeMs),
    bounceRate: calculateBounceRate(counts.bouncedSessions, counts.totalViewSessions),
    dateFrom: dateFrom.toISOString(),
    dateTo: dateTo.toISOString(),
  };
}

export function toAnalyticsTimeline(
  rows: RawTimelineRow[],
  granularity: TimelineGranularity,
): AnalyticsTimelineDto {
  const points: AnalyticsTimelinePointDto[] = rows.map((row) => ({
    period: formatTimelinePeriod(row.period, granularity),
    views: row.views,
    opens: row.opens,
    starts: row.starts,
    submissions: row.submissions,
    successes: row.successes,
    errors: row.errors,
    conversionRate: calculateConversionRate(row.submissions, row.views),
  }));

  return {
    granularity,
    points,
  };
}

export function toDeviceBreakdown(rows: RawDeviceRow[]): AnalyticsDeviceBreakdownDto {
  const breakdown: AnalyticsDeviceBreakdownDto = {
    desktop: 0,
    tablet: 0,
    mobile: 0,
    unknown: 0,
    total: 0,
  };

  for (const row of rows) {
    const device = normalizeDeviceName(row.device ?? undefined);
    breakdown[device] += row.count;
    breakdown.total += row.count;
  }

  return breakdown;
}

export function toCountryBreakdown(rows: RawCountryRow[]): AnalyticsCountryBreakdownDto {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const items: AnalyticsCountryBreakdownItemDto[] = rows
    .filter((row) => (row.country ?? '').length > 0)
    .map((row) => ({
      country: row.country ?? 'Unknown',
      count: row.count,
      percentage: total === 0 ? 0 : roundPercentage((row.count / total) * 100),
    }));

  return { items, total };
}

export function toBrowserBreakdown(rows: RawBrowserRow[]): AnalyticsBrowserBreakdownDto {
  const breakdown: AnalyticsBrowserBreakdownDto = {
    chrome: 0,
    safari: 0,
    firefox: 0,
    edge: 0,
    other: 0,
    total: 0,
  };

  for (const row of rows) {
    const browser = normalizeBrowserName(row.browser ?? undefined);
    breakdown[browser] += row.count;
    breakdown.total += row.count;
  }

  return breakdown;
}

export function toSourceBreakdown(rows: RawSourceRow[]): AnalyticsSourceBreakdownDto {
  const breakdown: AnalyticsSourceBreakdownDto = {
    direct: 0,
    organic: 0,
    referral: 0,
    campaign: 0,
    total: 0,
  };

  for (const row of rows) {
    const source = classifyTrafficSource({
      referrer: row.referrer ?? undefined,
      pageUrl: row.pageUrl ?? undefined,
      source: row.source ?? undefined,
    });
    breakdown[source] += row.count;
    breakdown.total += row.count;
  }

  return breakdown;
}

export function toPerformanceMetrics(row: RawPerformanceRow): AnalyticsPerformanceDto {
  return {
    loadCount: row.loadCount,
    averageResponseTimeMs: Math.round(row.averageResponseTimeMs),
    slowRequests: row.slowRequests,
    runtimeVersion: row.runtimeVersion,
    cacheHitRatio: null,
  };
}

export { SLOW_REQUEST_THRESHOLD_MS };

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}
