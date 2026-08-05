import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { NotFoundError, ValidationError } from '../src/errors/index.js';
import type {
  AnalyticsDevicesResponseDto,
  AnalyticsOverviewDto,
  AnalyticsPerformanceDto,
  AnalyticsTimelineDto,
} from '../src/types/analytics.types.js';
import type { ApiErrorResponse, ApiSuccessResponse } from '../src/utils/response.js';

const serviceMock = vi.hoisted(() => ({
  ingestPublicEvent: vi.fn(),
  getOverview: vi.fn(),
  getTimeline: vi.fn(),
  getDevices: vi.fn(),
  getCountries: vi.fn(),
  getSources: vi.fn(),
  getPerformance: vi.fn(),
}));

vi.mock('../src/services/analytics.service.js', () => ({
  analyticsService: serviceMock,
}));

const app = createApp();
const embedToken = 'wt_0123456789abcdef0123456789abcdef';
const widgetId = '11111111-1111-1111-1111-111111111111';

describe('Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /public/widgets/:embedToken/events returns 204', async () => {
    serviceMock.ingestPublicEvent.mockResolvedValue(undefined);

    await request(app)
      .post(`/public/widgets/${embedToken}/events`)
      .send({
        eventType: 'VIEW',
        sessionId: 'sess-1',
        metadata: {
          pageUrl: 'https://example.com',
          device: 'desktop',
        },
      })
      .expect(204);
  });

  it('POST /public/widgets/:embedToken/events returns 404 for unpublished widget', async () => {
    serviceMock.ingestPublicEvent.mockRejectedValue(new NotFoundError('Widget not found'));

    const response = await request(app)
      .post(`/public/widgets/${embedToken}/events`)
      .send({ eventType: 'VIEW', sessionId: 'sess-1' })
      .expect(404);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('POST /public/widgets/:embedToken/events returns 400 for unsupported event type', async () => {
    serviceMock.ingestPublicEvent.mockRejectedValue(new ValidationError('Unsupported analytics event type'));

    const response = await request(app)
      .post(`/public/widgets/${embedToken}/events`)
      .send({ eventType: 'VIEW', sessionId: 'sess-1' })
      .expect(400);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/v1/widgets/:id/analytics returns overview metrics', async () => {
    const overview: AnalyticsOverviewDto = {
      views: 100,
      uniqueVisitors: 80,
      opens: 60,
      starts: 40,
      submissions: 20,
      successes: 18,
      errors: 2,
      conversionRate: 20,
      completionRate: 45,
      averageCompletionTimeMs: 1500,
      bounceRate: 25,
      dateFrom: '2026-01-01T00:00:00.000Z',
      dateTo: '2026-01-31T00:00:00.000Z',
    };
    serviceMock.getOverview.mockResolvedValue(overview);

    const response = await request(app)
      .get(`/api/v1/widgets/${widgetId}/analytics`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<AnalyticsOverviewDto>;
    expect(body.data.views).toBe(100);
    expect(body.data.conversionRate).toBe(20);
  });

  it('GET /api/v1/widgets/:id/analytics/timeline returns timeline points', async () => {
    const timeline: AnalyticsTimelineDto = {
      granularity: 'day',
      points: [
        {
          period: '2026-08-01',
          views: 50,
          opens: 30,
          starts: 20,
          submissions: 10,
          successes: 9,
          errors: 1,
          conversionRate: 20,
        },
      ],
    };
    serviceMock.getTimeline.mockResolvedValue(timeline);

    const response = await request(app)
      .get(`/api/v1/widgets/${widgetId}/analytics/timeline?granularity=day`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<AnalyticsTimelineDto>;
    expect(body.data.points).toHaveLength(1);
  });

  it('GET /api/v1/widgets/:id/analytics/devices returns device and browser breakdowns', async () => {
    const devices: AnalyticsDevicesResponseDto = {
      devices: { desktop: 50, tablet: 10, mobile: 30, unknown: 5, total: 95 },
      browsers: { chrome: 60, safari: 20, firefox: 10, edge: 5, other: 0, total: 95 },
    };
    serviceMock.getDevices.mockResolvedValue(devices);

    const response = await request(app)
      .get(`/api/v1/widgets/${widgetId}/analytics/devices`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<AnalyticsDevicesResponseDto>;
    expect(body.data.devices.desktop).toBe(50);
    expect(body.data.browsers.chrome).toBe(60);
  });

  it('GET /api/v1/widgets/:id/analytics/performance returns performance metrics', async () => {
    const performance: AnalyticsPerformanceDto = {
      loadCount: 100,
      averageResponseTimeMs: 120,
      slowRequests: 3,
      runtimeVersion: '1.0.0',
      cacheHitRatio: null,
    };
    serviceMock.getPerformance.mockResolvedValue(performance);

    const response = await request(app)
      .get(`/api/v1/widgets/${widgetId}/analytics/performance`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<AnalyticsPerformanceDto>;
    expect(body.data.loadCount).toBe(100);
    expect(body.data.cacheHitRatio).toBeNull();
  });
});
