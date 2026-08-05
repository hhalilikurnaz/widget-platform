import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundError, ValidationError } from '../../src/errors/index.js';
import { AnalyticsService } from '../../src/services/analytics.service.js';

const analyticsRepositoryMock = vi.hoisted(() => ({
  createEvent: vi.fn(),
  getOverview: vi.fn(),
  getTimeline: vi.fn(),
  getDevices: vi.fn(),
  getBrowsers: vi.fn(),
  getCountries: vi.fn(),
  getSources: vi.fn(),
  getPerformance: vi.fn(),
  resolveWidgetVersionId: vi.fn(),
  isSupportedEventType: vi.fn(),
}));

const runtimeRepositoryMock = vi.hoisted(() => ({
  findPublishedByEmbedToken: vi.fn(),
}));

const widgetRepositoryMock = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdForWorkspace: vi.fn(),
}));

vi.mock('../../src/repositories/analytics.repository.js', () => ({
  analyticsRepository: analyticsRepositoryMock,
}));

vi.mock('../../src/repositories/runtime.repository.js', () => ({
  runtimeRepository: runtimeRepositoryMock,
}));

vi.mock('../../src/repositories/widget.repository.js', () => ({
  widgetRepository: widgetRepositoryMock,
}));

vi.mock('../../src/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const embedToken = 'wt_0123456789abcdef0123456789abcdef';

describe('AnalyticsService', () => {
  const service = new AnalyticsService();

  beforeEach(() => {
    vi.clearAllMocks();
    analyticsRepositoryMock.isSupportedEventType.mockReturnValue(true);
    widgetRepositoryMock.findByIdForWorkspace.mockResolvedValue({ id: 'widget-1' });
  });

  it('stores public analytics events for published widgets', async () => {
    runtimeRepositoryMock.findPublishedByEmbedToken.mockResolvedValue({
      widget: { id: 'widget-1', workspaceId: 'workspace-1' },
      publishedVersion: { id: 'version-2' },
    });
    analyticsRepositoryMock.createEvent.mockResolvedValue(undefined);

    await service.ingestPublicEvent(embedToken, {
      eventType: 'VIEW',
      sessionId: 'sess-1',
      visitorId: 'vis-1',
      metadata: {
        country: 'US',
        browser: 'Chrome',
        device: 'desktop',
        pageUrl: 'https://example.com',
      },
    });

    expect(analyticsRepositoryMock.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        widgetId: 'widget-1',
        type: 'VIEW',
        sessionId: 'sess-1',
      }),
    );
  });

  it('rejects analytics for unpublished widgets', async () => {
    runtimeRepositoryMock.findPublishedByEmbedToken.mockResolvedValue(null);

    await expect(
      service.ingestPublicEvent(embedToken, {
        eventType: 'VIEW',
        sessionId: 'sess-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects unsupported event types', async () => {
    runtimeRepositoryMock.findPublishedByEmbedToken.mockResolvedValue({
      widget: { id: 'widget-1', workspaceId: 'workspace-1' },
      publishedVersion: { id: 'version-2' },
    });
    analyticsRepositoryMock.isSupportedEventType.mockReturnValue(false);

    await expect(
      service.ingestPublicEvent(embedToken, {
        eventType: 'VIEW',
        sessionId: 'sess-1',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('returns dashboard overview metrics', async () => {
    widgetRepositoryMock.findByIdForWorkspace.mockResolvedValue({ id: 'widget-1' });
    analyticsRepositoryMock.getOverview.mockResolvedValue({
      views: 100,
      uniqueVisitors: 80,
      opens: 60,
      starts: 40,
      submissions: 20,
      successes: 18,
      errors: 2,
      averageCompletionTimeMs: 1500,
      bouncedSessions: 25,
      totalViewSessions: 100,
    });

    const overview = await service.getOverview('workspace-1', 'widget-1', {});

    expect(overview.views).toBe(100);
    expect(overview.conversionRate).toBe(20);
  });

  it('returns timeline and device breakdowns', async () => {
    widgetRepositoryMock.findByIdForWorkspace.mockResolvedValue({ id: 'widget-1' });
    analyticsRepositoryMock.getTimeline.mockResolvedValue([
      {
        period: new Date('2026-08-01T00:00:00.000Z'),
        views: 50,
        opens: 30,
        starts: 20,
        submissions: 10,
        successes: 9,
        errors: 1,
      },
    ]);
    analyticsRepositoryMock.getDevices.mockResolvedValue([{ device: 'desktop', count: 40 }]);
    analyticsRepositoryMock.getBrowsers.mockResolvedValue([{ browser: 'Chrome', count: 35 }]);

    const timeline = await service.getTimeline('workspace-1', 'widget-1', { granularity: 'day' });
    const devices = await service.getDevices('workspace-1', 'widget-1', {});

    expect(timeline.points).toHaveLength(1);
    expect(devices.devices.desktop).toBe(40);
    expect(devices.browsers.chrome).toBe(35);
  });
});
