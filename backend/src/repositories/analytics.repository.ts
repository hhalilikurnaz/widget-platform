import { Prisma, type AnalyticsEventType } from '@prisma/client';

import { prisma } from '../database/prisma.js';
import type {
  AnalyticsFilters,
  AnalyticsTimelineFilters,
  CreateAnalyticsEventInput,
  RawBrowserRow,
  RawCountryRow,
  RawDeviceRow,
  RawOverviewCounts,
  RawPerformanceRow,
  RawSourceRow,
  RawTimelineRow,
} from '../types/analytics.types.js';
import { SLOW_REQUEST_THRESHOLD_MS } from '../utils/analytics-aggregator.js';
import { toSqlFilterParams } from '../utils/analytics-filter.js';
import { getTimelineTruncUnit } from '../utils/timeline.js';

export class AnalyticsRepository {
  async createEvent(input: CreateAnalyticsEventInput): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        workspaceId: input.workspaceId,
        widgetId: input.widgetId,
        type: input.type,
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        metadata: input.metadata as Prisma.InputJsonValue,
        createdAt: input.occurredAt ?? new Date(),
      },
    });
  }

  async getOverview(filters: AnalyticsFilters, widgetVersionId?: string | null): Promise<RawOverviewCounts> {
    const params = toSqlFilterParams(filters, widgetVersionId);
    const rows = await prisma.$queryRaw<
      Array<{
        views: bigint;
        unique_visitors: bigint;
        opens: bigint;
        starts: bigint;
        submissions: bigint;
        successes: bigint;
        errors: bigint;
        average_completion_time_ms: number | null;
        bounced_sessions: bigint;
        total_view_sessions: bigint;
      }>
    >`
      WITH filtered AS (
        SELECT *
        FROM analytics_events
        WHERE widget_id = ${filters.widgetId}::uuid
          AND created_at >= ${filters.dateFrom}
          AND created_at <= ${filters.dateTo}
          AND (${params.country}::text IS NULL OR metadata->>'country' = ${params.country})
          AND (${params.browser}::text IS NULL OR metadata->>'browser' = ${params.browser})
          AND (${params.device}::text IS NULL OR metadata->>'device' = ${params.device})
          AND (${params.widgetVersionId}::text IS NULL OR metadata->>'widgetVersionId' = ${params.widgetVersionId})
          AND (
            ${params.source}::text IS NULL OR
            CASE
              WHEN metadata->>'source' IN ('direct', 'organic', 'referral', 'campaign') THEN metadata->>'source'
              WHEN COALESCE(metadata->>'referrer', '') = '' THEN 'direct'
              WHEN COALESCE(metadata->>'pageUrl', '') LIKE '%utm_%' THEN 'campaign'
              WHEN metadata->>'referrer' ILIKE '%google.%'
                OR metadata->>'referrer' ILIKE '%bing.%'
                OR metadata->>'referrer' ILIKE '%yahoo.%'
                OR metadata->>'referrer' ILIKE '%duckduckgo.%'
                THEN 'organic'
              ELSE 'referral'
            END = ${params.source}
          )
      ),
      bounce AS (
        SELECT
          COUNT(*) FILTER (
            WHERE session_id IS NOT NULL
              AND session_id IN (
                SELECT session_id
                FROM filtered
                WHERE type = 'VIEW'::"AnalyticsEventType"
                  AND session_id IS NOT NULL
                GROUP BY session_id
                HAVING COUNT(*) FILTER (WHERE type = 'OPEN'::"AnalyticsEventType") = 0
              )
          ) AS bounced_sessions,
          COUNT(DISTINCT session_id) FILTER (
            WHERE type = 'VIEW'::"AnalyticsEventType" AND session_id IS NOT NULL
          ) AS total_view_sessions
        FROM filtered
      )
      SELECT
        COUNT(*) FILTER (WHERE type = 'VIEW'::"AnalyticsEventType") AS views,
        COUNT(DISTINCT visitor_id) AS unique_visitors,
        COUNT(*) FILTER (WHERE type = 'OPEN'::"AnalyticsEventType") AS opens,
        COUNT(*) FILTER (WHERE type = 'START'::"AnalyticsEventType") AS starts,
        COUNT(*) FILTER (WHERE type = 'SUBMIT'::"AnalyticsEventType") AS submissions,
        COUNT(*) FILTER (WHERE type = 'SUCCESS'::"AnalyticsEventType") AS successes,
        COUNT(*) FILTER (WHERE type = 'ERROR'::"AnalyticsEventType") AS errors,
        AVG(NULLIF((metadata->>'durationMs')::numeric, 0)) FILTER (
          WHERE type = 'SUCCESS'::"AnalyticsEventType"
        ) AS average_completion_time_ms,
        bounce.bounced_sessions,
        bounce.total_view_sessions
      FROM filtered
      CROSS JOIN bounce
      GROUP BY bounce.bounced_sessions, bounce.total_view_sessions
    `;

    const row = rows[0];
    if (!row) {
      return emptyOverviewCounts();
    }

    return {
      views: Number(row.views),
      uniqueVisitors: Number(row.unique_visitors),
      opens: Number(row.opens),
      starts: Number(row.starts),
      submissions: Number(row.submissions),
      successes: Number(row.successes),
      errors: Number(row.errors),
      averageCompletionTimeMs: row.average_completion_time_ms ?? 0,
      bouncedSessions: Number(row.bounced_sessions),
      totalViewSessions: Number(row.total_view_sessions),
    };
  }

  async getTimeline(
    filters: AnalyticsTimelineFilters,
    widgetVersionId?: string | null,
  ): Promise<RawTimelineRow[]> {
    const params = toSqlFilterParams(filters, widgetVersionId);
    const truncUnit = getTimelineTruncUnit(filters.granularity);

    const rows = await prisma.$queryRaw<
      Array<{
        period: Date;
        views: bigint;
        opens: bigint;
        starts: bigint;
        submissions: bigint;
        successes: bigint;
        errors: bigint;
      }>
    >`
      SELECT
        DATE_TRUNC(${truncUnit}, created_at) AS period,
        COUNT(*) FILTER (WHERE type = 'VIEW'::"AnalyticsEventType") AS views,
        COUNT(*) FILTER (WHERE type = 'OPEN'::"AnalyticsEventType") AS opens,
        COUNT(*) FILTER (WHERE type = 'START'::"AnalyticsEventType") AS starts,
        COUNT(*) FILTER (WHERE type = 'SUBMIT'::"AnalyticsEventType") AS submissions,
        COUNT(*) FILTER (WHERE type = 'SUCCESS'::"AnalyticsEventType") AS successes,
        COUNT(*) FILTER (WHERE type = 'ERROR'::"AnalyticsEventType") AS errors
      FROM analytics_events
      WHERE widget_id = ${filters.widgetId}::uuid
        AND created_at >= ${filters.dateFrom}
        AND created_at <= ${filters.dateTo}
        AND (${params.country}::text IS NULL OR metadata->>'country' = ${params.country})
        AND (${params.browser}::text IS NULL OR metadata->>'browser' = ${params.browser})
        AND (${params.device}::text IS NULL OR metadata->>'device' = ${params.device})
        AND (${params.widgetVersionId}::text IS NULL OR metadata->>'widgetVersionId' = ${params.widgetVersionId})
        AND (
          ${params.source}::text IS NULL OR
          CASE
            WHEN metadata->>'source' IN ('direct', 'organic', 'referral', 'campaign') THEN metadata->>'source'
            WHEN COALESCE(metadata->>'referrer', '') = '' THEN 'direct'
            WHEN COALESCE(metadata->>'pageUrl', '') LIKE '%utm_%' THEN 'campaign'
            WHEN metadata->>'referrer' ILIKE '%google.%'
              OR metadata->>'referrer' ILIKE '%bing.%'
              OR metadata->>'referrer' ILIKE '%yahoo.%'
              OR metadata->>'referrer' ILIKE '%duckduckgo.%'
              THEN 'organic'
            ELSE 'referral'
          END = ${params.source}
        )
      GROUP BY period
      ORDER BY period ASC
    `;

    return rows.map((row) => ({
      period: row.period,
      views: Number(row.views),
      opens: Number(row.opens),
      starts: Number(row.starts),
      submissions: Number(row.submissions),
      successes: Number(row.successes),
      errors: Number(row.errors),
    }));
  }

  async getDevices(filters: AnalyticsFilters, widgetVersionId?: string | null): Promise<RawDeviceRow[]> {
    const params = toSqlFilterParams(filters, widgetVersionId);

    return prisma.$queryRaw<RawDeviceRow[]>`
      SELECT metadata->>'device' AS device, COUNT(*)::int AS count
      FROM analytics_events
      WHERE widget_id = ${filters.widgetId}::uuid
        AND created_at >= ${filters.dateFrom}
        AND created_at <= ${filters.dateTo}
        AND type = 'VIEW'::"AnalyticsEventType"
        AND (${params.country}::text IS NULL OR metadata->>'country' = ${params.country})
        AND (${params.browser}::text IS NULL OR metadata->>'browser' = ${params.browser})
        AND (${params.device}::text IS NULL OR metadata->>'device' = ${params.device})
        AND (${params.widgetVersionId}::text IS NULL OR metadata->>'widgetVersionId' = ${params.widgetVersionId})
      GROUP BY metadata->>'device'
      ORDER BY count DESC
    `;
  }

  async getCountries(filters: AnalyticsFilters, widgetVersionId?: string | null): Promise<RawCountryRow[]> {
    const params = toSqlFilterParams(filters, widgetVersionId);

    return prisma.$queryRaw<RawCountryRow[]>`
      SELECT metadata->>'country' AS country, COUNT(*)::int AS count
      FROM analytics_events
      WHERE widget_id = ${filters.widgetId}::uuid
        AND created_at >= ${filters.dateFrom}
        AND created_at <= ${filters.dateTo}
        AND type = 'VIEW'::"AnalyticsEventType"
        AND (${params.country}::text IS NULL OR metadata->>'country' = ${params.country})
        AND (${params.browser}::text IS NULL OR metadata->>'browser' = ${params.browser})
        AND (${params.device}::text IS NULL OR metadata->>'device' = ${params.device})
        AND (${params.widgetVersionId}::text IS NULL OR metadata->>'widgetVersionId' = ${params.widgetVersionId})
      GROUP BY metadata->>'country'
      ORDER BY count DESC
      LIMIT 20
    `;
  }

  async getSources(filters: AnalyticsFilters, widgetVersionId?: string | null): Promise<RawSourceRow[]> {
    const params = toSqlFilterParams(filters, widgetVersionId);

    return prisma.$queryRaw<RawSourceRow[]>`
      SELECT
        metadata->>'referrer' AS referrer,
        metadata->>'pageUrl' AS "pageUrl",
        metadata->>'source' AS source,
        COUNT(*)::int AS count
      FROM analytics_events
      WHERE widget_id = ${filters.widgetId}::uuid
        AND created_at >= ${filters.dateFrom}
        AND created_at <= ${filters.dateTo}
        AND type = 'VIEW'::"AnalyticsEventType"
        AND (${params.country}::text IS NULL OR metadata->>'country' = ${params.country})
        AND (${params.browser}::text IS NULL OR metadata->>'browser' = ${params.browser})
        AND (${params.device}::text IS NULL OR metadata->>'device' = ${params.device})
        AND (${params.widgetVersionId}::text IS NULL OR metadata->>'widgetVersionId' = ${params.widgetVersionId})
      GROUP BY metadata->>'referrer', metadata->>'pageUrl', metadata->>'source'
      ORDER BY count DESC
    `;
  }

  async getBrowsers(filters: AnalyticsFilters, widgetVersionId?: string | null): Promise<RawBrowserRow[]> {
    const params = toSqlFilterParams(filters, widgetVersionId);

    return prisma.$queryRaw<RawBrowserRow[]>`
      SELECT metadata->>'browser' AS browser, COUNT(*)::int AS count
      FROM analytics_events
      WHERE widget_id = ${filters.widgetId}::uuid
        AND created_at >= ${filters.dateFrom}
        AND created_at <= ${filters.dateTo}
        AND type = 'VIEW'::"AnalyticsEventType"
        AND (${params.country}::text IS NULL OR metadata->>'country' = ${params.country})
        AND (${params.browser}::text IS NULL OR metadata->>'browser' = ${params.browser})
        AND (${params.device}::text IS NULL OR metadata->>'device' = ${params.device})
        AND (${params.widgetVersionId}::text IS NULL OR metadata->>'widgetVersionId' = ${params.widgetVersionId})
      GROUP BY metadata->>'browser'
      ORDER BY count DESC
    `;
  }

  async getPerformance(
    filters: AnalyticsFilters,
    widgetVersionId?: string | null,
  ): Promise<RawPerformanceRow> {
    const params = toSqlFilterParams(filters, widgetVersionId);

    const rows = await prisma.$queryRaw<
      Array<{
        load_count: bigint;
        average_response_time_ms: number | null;
        slow_requests: bigint;
        runtime_version: string | null;
      }>
    >`
      SELECT
        COUNT(*) FILTER (WHERE type = 'VIEW'::"AnalyticsEventType") AS load_count,
        AVG(NULLIF((metadata->>'responseTimeMs')::numeric, 0)) AS average_response_time_ms,
        COUNT(*) FILTER (
          WHERE (metadata->>'responseTimeMs')::numeric > ${SLOW_REQUEST_THRESHOLD_MS}
        ) AS slow_requests,
        (
          SELECT metadata->>'runtimeVersion'
          FROM analytics_events
          WHERE widget_id = ${filters.widgetId}::uuid
            AND created_at >= ${filters.dateFrom}
            AND created_at <= ${filters.dateTo}
            AND metadata->>'runtimeVersion' IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 1
        ) AS runtime_version
      FROM analytics_events
      WHERE widget_id = ${filters.widgetId}::uuid
        AND created_at >= ${filters.dateFrom}
        AND created_at <= ${filters.dateTo}
        AND (${params.country}::text IS NULL OR metadata->>'country' = ${params.country})
        AND (${params.browser}::text IS NULL OR metadata->>'browser' = ${params.browser})
        AND (${params.device}::text IS NULL OR metadata->>'device' = ${params.device})
        AND (${params.widgetVersionId}::text IS NULL OR metadata->>'widgetVersionId' = ${params.widgetVersionId})
    `;

    const row = rows[0];
    if (!row) {
      return {
        loadCount: 0,
        averageResponseTimeMs: 0,
        slowRequests: 0,
        runtimeVersion: null,
      };
    }

    return {
      loadCount: Number(row.load_count),
      averageResponseTimeMs: row.average_response_time_ms ?? 0,
      slowRequests: Number(row.slow_requests),
      runtimeVersion: row.runtime_version,
    };
  }

  async resolveWidgetVersionId(widgetId: string, version: number): Promise<string | null> {
    const record = await prisma.widgetVersion.findFirst({
      where: { widgetId, version },
      select: { id: true },
    });

    return record?.id ?? null;
  }

  isSupportedEventType(value: string): value is AnalyticsEventType {
    return (
      value === 'VIEW' ||
      value === 'OPEN' ||
      value === 'START' ||
      value === 'FIELD_FOCUS' ||
      value === 'FIELD_BLUR' ||
      value === 'FIELD_CHANGE' ||
      value === 'SUBMIT' ||
      value === 'SUCCESS' ||
      value === 'ERROR' ||
      value === 'CLOSE'
    );
  }
}

function emptyOverviewCounts(): RawOverviewCounts {
  return {
    views: 0,
    uniqueVisitors: 0,
    opens: 0,
    starts: 0,
    submissions: 0,
    successes: 0,
    errors: 0,
    averageCompletionTimeMs: 0,
    bouncedSessions: 0,
    totalViewSessions: 0,
  };
}

export const analyticsRepository = new AnalyticsRepository();
