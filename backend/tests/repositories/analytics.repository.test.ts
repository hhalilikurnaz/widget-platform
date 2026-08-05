import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsRepository } from '../../src/repositories/analytics.repository.js';

const prismaMock = vi.hoisted(() => ({
  analyticsEvent: {
    create: vi.fn(),
  },
  widgetVersion: {
    findFirst: vi.fn(),
  },
  $queryRaw: vi.fn(),
}));

vi.mock('../../src/database/prisma.js', () => ({
  prisma: prismaMock,
}));

describe('AnalyticsRepository', () => {
  const repository = new AnalyticsRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createEvent stores analytics metadata', async () => {
    prismaMock.analyticsEvent.create.mockResolvedValue({ id: 'event-1' });

    await repository.createEvent({
      workspaceId: 'workspace-1',
      widgetId: 'widget-1',
      widgetVersionId: 'version-1',
      type: 'VIEW',
      sessionId: 'sess-1',
      visitorId: 'vis-1',
      metadata: {
        country: 'US',
        browser: 'Chrome',
        device: 'desktop',
        pageUrl: 'https://example.com',
      },
    });

    expect(prismaMock.analyticsEvent.create).toHaveBeenCalledOnce();
  });

  it('getOverview returns aggregated counts', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        views: BigInt(100),
        unique_visitors: BigInt(80),
        opens: BigInt(60),
        starts: BigInt(40),
        submissions: BigInt(20),
        successes: BigInt(18),
        errors: BigInt(2),
        average_completion_time_ms: 1500,
        bounced_sessions: BigInt(25),
        total_view_sessions: BigInt(100),
      },
    ]);

    const result = await repository.getOverview({
      widgetId: 'widget-1',
      dateFrom: new Date('2026-01-01T00:00:00.000Z'),
      dateTo: new Date('2026-01-31T00:00:00.000Z'),
    });

    expect(result.views).toBe(100);
    expect(result.uniqueVisitors).toBe(80);
    expect(result.submissions).toBe(20);
  });

  it('resolveWidgetVersionId returns version id', async () => {
    prismaMock.widgetVersion.findFirst.mockResolvedValue({ id: 'version-2' });

    const versionId = await repository.resolveWidgetVersionId('widget-1', 2);

    expect(versionId).toBe('version-2');
  });

  it('isSupportedAnalyticsEventType validates event types', async () => {
    const { isSupportedAnalyticsEventType } = await import('../../src/utils/analytics-event-types.js');

    expect(isSupportedAnalyticsEventType('VIEW')).toBe(true);
    expect(isSupportedAnalyticsEventType('FIELD_FOCUS')).toBe(true);
    expect(isSupportedAnalyticsEventType('INVALID')).toBe(false);
  });
});
