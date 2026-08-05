import type { AnalyticsEventType } from '@prisma/client';

export const SUPPORTED_ANALYTICS_EVENT_TYPES = [
  'VIEW',
  'OPEN',
  'START',
  'FIELD_FOCUS',
  'FIELD_BLUR',
  'FIELD_CHANGE',
  'SUBMIT',
  'SUCCESS',
  'ERROR',
  'CLOSE',
] as const satisfies readonly AnalyticsEventType[];

export type SupportedAnalyticsEventType = (typeof SUPPORTED_ANALYTICS_EVENT_TYPES)[number];

export type AnalyticsDevice = 'desktop' | 'tablet' | 'mobile';

export type AnalyticsSource = 'direct' | 'organic' | 'referral' | 'campaign';

export type TimelineGranularity = 'hour' | 'day' | 'week' | 'month';

export interface AnalyticsEventMetadata {
  widgetVersionId?: string;
  country?: string;
  browser?: string;
  device?: AnalyticsDevice;
  operatingSystem?: string;
  language?: string;
  screenResolution?: string;
  timezone?: string;
  referrer?: string;
  pageUrl?: string;
  source?: AnalyticsSource;
  occurredAt?: string;
  durationMs?: number;
  responseTimeMs?: number;
  runtimeVersion?: string;
  fieldId?: string;
  [key: string]: unknown;
}

export interface CreateAnalyticsEventInput {
  workspaceId: string;
  widgetId: string;
  widgetVersionId: string;
  type: AnalyticsEventType;
  sessionId: string;
  visitorId?: string;
  metadata: AnalyticsEventMetadata;
  occurredAt?: Date;
}

export interface AnalyticsFilters {
  widgetId: string;
  dateFrom: Date;
  dateTo: Date;
  version?: number;
  country?: string;
  browser?: string;
  device?: AnalyticsDevice;
  source?: AnalyticsSource;
}

export interface AnalyticsTimelineFilters extends AnalyticsFilters {
  granularity: TimelineGranularity;
}

export interface AnalyticsOverviewDto {
  views: number;
  uniqueVisitors: number;
  opens: number;
  starts: number;
  submissions: number;
  successes: number;
  errors: number;
  conversionRate: number;
  completionRate: number;
  averageCompletionTimeMs: number;
  bounceRate: number;
  dateFrom: string;
  dateTo: string;
}

export interface AnalyticsTimelinePointDto {
  period: string;
  views: number;
  opens: number;
  starts: number;
  submissions: number;
  successes: number;
  errors: number;
  conversionRate: number;
}

export interface AnalyticsTimelineDto {
  granularity: TimelineGranularity;
  points: AnalyticsTimelinePointDto[];
}

export interface AnalyticsDeviceBreakdownDto {
  desktop: number;
  tablet: number;
  mobile: number;
  unknown: number;
  total: number;
}

export interface AnalyticsCountryBreakdownItemDto {
  country: string;
  count: number;
  percentage: number;
}

export interface AnalyticsCountryBreakdownDto {
  items: AnalyticsCountryBreakdownItemDto[];
  total: number;
}

export interface AnalyticsBrowserBreakdownDto {
  chrome: number;
  safari: number;
  firefox: number;
  edge: number;
  other: number;
  total: number;
}

export interface AnalyticsSourceBreakdownDto {
  direct: number;
  organic: number;
  referral: number;
  campaign: number;
  total: number;
}

export interface AnalyticsDevicesResponseDto {
  devices: AnalyticsDeviceBreakdownDto;
  browsers: AnalyticsBrowserBreakdownDto;
}

export interface AnalyticsPerformanceDto {
  loadCount: number;
  averageResponseTimeMs: number;
  slowRequests: number;
  runtimeVersion: string | null;
  cacheHitRatio: number | null;
}

export interface RawOverviewCounts {
  views: number;
  uniqueVisitors: number;
  opens: number;
  starts: number;
  submissions: number;
  successes: number;
  errors: number;
  averageCompletionTimeMs: number;
  bouncedSessions: number;
  totalViewSessions: number;
}

export interface RawTimelineRow {
  period: Date;
  views: number;
  opens: number;
  starts: number;
  submissions: number;
  successes: number;
  errors: number;
}

export interface RawDeviceRow {
  device: string | null;
  count: number;
}

export interface RawCountryRow {
  country: string | null;
  count: number;
}

export interface RawSourceRow {
  referrer: string | null;
  pageUrl: string | null;
  source: string | null;
  count: number;
}

export interface RawBrowserRow {
  browser: string | null;
  count: number;
}

export interface RawPerformanceRow {
  loadCount: number;
  averageResponseTimeMs: number;
  slowRequests: number;
  runtimeVersion: string | null;
}
