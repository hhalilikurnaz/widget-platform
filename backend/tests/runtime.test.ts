import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { NotFoundError } from '../src/errors/index.js';
import type { PublicConfigDto, PublicHealthDto, PublicRuntimeDto } from '../src/types/runtime.types.js';
import type { ApiErrorResponse, ApiSuccessResponse } from '../src/utils/response.js';
import { createDefaultSchema } from '../src/utils/schema-default.js';

const serviceMock = vi.hoisted(() => ({
  loadConfig: vi.fn(),
  loadRuntime: vi.fn(),
  loadHealth: vi.fn(),
}));

vi.mock('../src/services/runtime.service.js', () => ({
  runtimeService: serviceMock,
}));

const app = createApp();

const embedToken = 'wt_0123456789abcdef0123456789abcdef';

const cache = {
  etag: '"abc123def4567890"',
  lastModified: new Date('2026-01-02T00:00:00.000Z'),
  cacheControl: 'public, max-age=300',
};

describe('Public Runtime API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /public/widgets/:embedToken/config returns published config', async () => {
    const config: PublicConfigDto = {
      schema: createDefaultSchema('Contact Us') as PublicConfigDto['schema'],
      theme: {},
      version: 2,
      publishedAt: '2026-01-02T00:00:00.000Z',
    };
    serviceMock.loadConfig.mockResolvedValue({ config, cache });

    const response = await request(app)
      .get(`/public/widgets/${embedToken}/config`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<PublicConfigDto>;
    expect(body.data.version).toBe(2);
    expect(response.headers.etag).toBe(cache.etag);
    expect(response.headers['cache-control']).toBe(cache.cacheControl);
  });

  it('GET /public/widgets/:embedToken/config returns 304 when etag matches', async () => {
    serviceMock.loadConfig.mockResolvedValue({
      config: {
        schema: createDefaultSchema('Contact Us') as PublicConfigDto['schema'],
        theme: {},
        version: 2,
        publishedAt: '2026-01-02T00:00:00.000Z',
      },
      cache,
    });

    await request(app)
      .get(`/public/widgets/${embedToken}/config`)
      .set('If-None-Match', cache.etag)
      .expect(304);
  });

  it('GET /public/widgets/:embedToken/runtime returns runtime payload', async () => {
    const runtime: PublicRuntimeDto = {
      widget: { name: 'Contact Us', slug: 'contact-us', description: null },
      version: 2,
      schema: createDefaultSchema('Contact Us') as PublicRuntimeDto['schema'],
      theme: {},
      behavior: {},
      triggers: { type: 'immediate' },
      localization: { defaultLocale: 'en', locales: {} },
      animations: {},
      runtimeVersion: '1.0.0',
      embedSnippet: `<script src="https://cdn.widgetplatform.com/widget.js"></script>
<script>
WidgetPlatform.init({
  token: "${embedToken}"
})
</script>`,
    };
    serviceMock.loadRuntime.mockResolvedValue({ runtime, cache });

    const response = await request(app)
      .get(`/public/widgets/${embedToken}/runtime`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<PublicRuntimeDto>;
    expect(body.data.runtimeVersion).toBe('1.0.0');
    expect(body.data.embedSnippet).toContain('WidgetPlatform.init');
  });

  it('GET /public/widgets/:embedToken/health returns health status', async () => {
    const health: PublicHealthDto = {
      exists: true,
      published: true,
      runtimeVersion: '1.0.0',
      cacheStatus: 'enabled',
    };
    serviceMock.loadHealth.mockResolvedValue(health);

    const response = await request(app)
      .get(`/public/widgets/${embedToken}/health`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<PublicHealthDto>;
    expect(body.data.published).toBe(true);
  });

  it('GET /public/widgets/:embedToken/config returns 404 for unknown token', async () => {
    serviceMock.loadConfig.mockRejectedValue(new NotFoundError('Widget not found'));

    const response = await request(app)
      .get(`/public/widgets/${embedToken}/config`)
      .expect(404);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('GET /public/widgets/:embedToken/config rejects invalid token format', async () => {
    const response = await request(app).get('/public/widgets/not-a-token/config').expect(400);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
