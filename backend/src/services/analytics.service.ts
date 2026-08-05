import type { Widget } from '@prisma/client';

import { NotFoundError, ValidationError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { analyticsRepository } from '../repositories/analytics.repository.js';
import { runtimeRepository } from '../repositories/runtime.repository.js';
import type {
  AnalyticsQuery,
  AnalyticsTimelineQuery,
  IngestAnalyticsEventBody,
} from '../schemas/analytics.schema.js';
import type {
  AnalyticsCountryBreakdownDto,
  AnalyticsDevicesResponseDto,
  AnalyticsOverviewDto,
  AnalyticsPerformanceDto,
  AnalyticsSourceBreakdownDto,
  AnalyticsTimelineDto,
} from '../types/analytics.types.js';
import {
  toAnalyticsOverview,
  toAnalyticsTimeline,
  toBrowserBreakdown,
  toCountryBreakdown,
  toDeviceBreakdown,
  toPerformanceMetrics,
  toSourceBreakdown,
} from '../utils/analytics-aggregator.js';
import {
  buildAnalyticsFilters,
  buildAnalyticsTimelineFilters,
} from '../utils/analytics-filter.js';
import { buildStoredEventMetadata, extractEventTimestamp } from '../utils/analytics-mapper.js';
import { isSupportedAnalyticsEventType } from '../utils/analytics-event-types.js';
import { ensureWidgetInWorkspace } from '../utils/workspace-access.js';

const NOT_FOUND_MESSAGE = 'Widget not found';

export class AnalyticsService {
  async ingestPublicEvent(embedToken: string, body: IngestAnalyticsEventBody): Promise<void> {
    const record = await runtimeRepository.findPublishedByEmbedToken(embedToken);

    if (!record) {
      logger.info({ embedToken }, 'Analytics event rejected');
      throw new NotFoundError(NOT_FOUND_MESSAGE);
    }

    if (!isSupportedAnalyticsEventType(body.eventType)) {
      logger.info({ embedToken, eventType: body.eventType }, 'Analytics event rejected');
      throw new ValidationError('Unsupported analytics event type');
    }

    logger.info(
      { embedToken, widgetId: record.widget.id, eventType: body.eventType },
      'Analytics event received',
    );

    const metadata = buildStoredEventMetadata({
      widgetVersionId: record.publishedVersion.id,
      metadata: body.metadata,
      occurredAt: body.metadata?.occurredAt,
    });

    await analyticsRepository.createEvent({
      workspaceId: record.widget.workspaceId,
      widgetId: record.widget.id,
      widgetVersionId: record.publishedVersion.id,
      type: body.eventType,
      sessionId: body.sessionId,
      visitorId: body.visitorId,
      metadata,
      occurredAt: extractEventTimestamp(metadata, new Date()),
    });
  }

  async getOverview(
    workspaceId: string,
    widgetId: string,
    query: AnalyticsQuery,
    preloaded?: Widget,
  ): Promise<AnalyticsOverviewDto> {
    await ensureWidgetInWorkspace(widgetId, workspaceId, preloaded);
    const filters = buildAnalyticsFilters(workspaceId, widgetId, query);
    const widgetVersionId = await this.resolveVersionFilter(widgetId, query.version);
    const counts = await analyticsRepository.getOverview(filters, widgetVersionId);

    logger.info({ widgetId, workspaceId }, 'Dashboard queried');

    return toAnalyticsOverview(counts, filters.dateFrom, filters.dateTo);
  }

  async getTimeline(
    workspaceId: string,
    widgetId: string,
    query: AnalyticsTimelineQuery,
    preloaded?: Widget,
  ): Promise<AnalyticsTimelineDto> {
    await ensureWidgetInWorkspace(widgetId, workspaceId, preloaded);
    const filters = buildAnalyticsTimelineFilters(workspaceId, widgetId, query);
    const widgetVersionId = await this.resolveVersionFilter(widgetId, query.version);
    const rows = await analyticsRepository.getTimeline(filters, widgetVersionId);

    logger.info({ widgetId, workspaceId, granularity: filters.granularity }, 'Timeline queried');

    return toAnalyticsTimeline(rows, filters.granularity);
  }

  async getDevices(
    workspaceId: string,
    widgetId: string,
    query: AnalyticsQuery,
    preloaded?: Widget,
  ): Promise<AnalyticsDevicesResponseDto> {
    await ensureWidgetInWorkspace(widgetId, workspaceId, preloaded);
    const filters = buildAnalyticsFilters(workspaceId, widgetId, query);
    const widgetVersionId = await this.resolveVersionFilter(widgetId, query.version);
    const [deviceRows, browserRows] = await Promise.all([
      analyticsRepository.getDevices(filters, widgetVersionId),
      analyticsRepository.getBrowsers(filters, widgetVersionId),
    ]);

    return {
      devices: toDeviceBreakdown(deviceRows),
      browsers: toBrowserBreakdown(browserRows),
    };
  }

  async getCountries(
    workspaceId: string,
    widgetId: string,
    query: AnalyticsQuery,
    preloaded?: Widget,
  ): Promise<AnalyticsCountryBreakdownDto> {
    await ensureWidgetInWorkspace(widgetId, workspaceId, preloaded);
    const filters = buildAnalyticsFilters(workspaceId, widgetId, query);
    const widgetVersionId = await this.resolveVersionFilter(widgetId, query.version);
    const rows = await analyticsRepository.getCountries(filters, widgetVersionId);

    return toCountryBreakdown(rows);
  }

  async getSources(
    workspaceId: string,
    widgetId: string,
    query: AnalyticsQuery,
    preloaded?: Widget,
  ): Promise<AnalyticsSourceBreakdownDto> {
    await ensureWidgetInWorkspace(widgetId, workspaceId, preloaded);
    const filters = buildAnalyticsFilters(workspaceId, widgetId, query);
    const widgetVersionId = await this.resolveVersionFilter(widgetId, query.version);
    const rows = await analyticsRepository.getSources(filters, widgetVersionId);

    return toSourceBreakdown(rows);
  }

  async getPerformance(
    workspaceId: string,
    widgetId: string,
    query: AnalyticsQuery,
    preloaded?: Widget,
  ): Promise<AnalyticsPerformanceDto> {
    await ensureWidgetInWorkspace(widgetId, workspaceId, preloaded);
    const filters = buildAnalyticsFilters(workspaceId, widgetId, query);
    const widgetVersionId = await this.resolveVersionFilter(widgetId, query.version);
    const row = await analyticsRepository.getPerformance(filters, widgetVersionId);

    return toPerformanceMetrics(row);
  }

  private async resolveVersionFilter(
    widgetId: string,
    version?: number,
  ): Promise<string | null | undefined> {
    if (version === undefined) {
      return undefined;
    }

    return analyticsRepository.resolveWidgetVersionId(widgetId, version);
  }
}

export const analyticsService = new AnalyticsService();
