import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { NotFoundError, UnprocessableEntityError } from '../src/errors/index.js';
import type {
  PublishWidgetResultDto,
  RestoreVersionResultDto,
  WidgetVersionSummaryDto,
} from '../src/types/widget-version.types.js';
import type { ApiErrorResponse, ApiSuccessResponse } from '../src/utils/response.js';

const serviceMock = vi.hoisted(() => ({
  publishWidget: vi.fn(),
  unpublishWidget: vi.fn(),
  listVersions: vi.fn(),
  getVersion: vi.fn(),
  restoreVersion: vi.fn(),
}));

vi.mock('../src/services/widget-version.service.js', () => ({
  widgetVersionService: serviceMock,
}));

const app = createApp();

const widgetId = '11111111-1111-1111-1111-111111111111';
const versionId = '22222222-2222-2222-2222-222222222222';

describe('Widget Version API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/v1/widgets/:id/publish publishes widget', async () => {
    const publishResult: PublishWidgetResultDto = {
      id: widgetId,
      status: 'PUBLISHED',
      version: 2,
      versionId,
      embedToken: 'wt_demo1234567890abcdef',
      embedSnippet: '<script src="https://cdn.widgetplatform.com/v1/wt_demo1234567890abcdef.js" async></script>',
      publicConfigUrl: 'https://api.widgetplatform.com/api/v1/public/widgets/wt_demo1234567890abcdef/config',
      publishedAt: '2026-01-02T00:00:00.000Z',
    };
    serviceMock.publishWidget.mockResolvedValue(publishResult);

    const response = await request(app).post(`/api/v1/widgets/${widgetId}/publish`).expect(200);

    const body = response.body as ApiSuccessResponse<PublishWidgetResultDto>;
    expect(body.data.status).toBe('PUBLISHED');
    expect(body.data.embedToken).toMatch(/^wt_/);
  });

  it('POST /api/v1/widgets/:id/unpublish unpublishes widget', async () => {
    serviceMock.unpublishWidget.mockResolvedValue({
      id: widgetId,
      status: 'DRAFT',
      publishedAt: null,
    });

    const response = await request(app).post(`/api/v1/widgets/${widgetId}/unpublish`).expect(200);

    const body = response.body as ApiSuccessResponse<{ status: string }>;
    expect(body.data.status).toBe('DRAFT');
  });

  it('GET /api/v1/widgets/:id/versions returns version history', async () => {
    const versions: WidgetVersionSummaryDto[] = [
      {
        id: versionId,
        version: 2,
        published: true,
        publishedAt: '2026-01-02T00:00:00.000Z',
        createdAt: '2026-01-02T00:00:00.000Z',
        author: '33333333-3333-3333-3333-333333333333',
      },
    ];
    serviceMock.listVersions.mockResolvedValue(versions);

    const response = await request(app).get(`/api/v1/widgets/${widgetId}/versions`).expect(200);

    const body = response.body as ApiSuccessResponse<WidgetVersionSummaryDto[]>;
    expect(body.data).toHaveLength(1);
    expect(body.data[0].version).toBe(2);
  });

  it('POST /api/v1/widgets/:id/versions/:versionId/restore creates new draft', async () => {
    const restoreResult: RestoreVersionResultDto = {
      widgetId,
      versionId: '33333333-3333-3333-3333-333333333333',
      version: 3,
      status: 'DRAFT',
      restoredFromVersion: 2,
    };
    serviceMock.restoreVersion.mockResolvedValue(restoreResult);

    const response = await request(app)
      .post(`/api/v1/widgets/${widgetId}/versions/${versionId}/restore`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<RestoreVersionResultDto>;
    expect(body.data.status).toBe('DRAFT');
    expect(body.data.restoredFromVersion).toBe(2);
  });

  it('POST /api/v1/widgets/:id/publish returns 422 on validation failure', async () => {
    serviceMock.publishWidget.mockRejectedValue(
      new UnprocessableEntityError('Publish validation failed', {
        errors: [{ path: 'schema', message: 'Invalid schema' }],
      }),
    );

    const response = await request(app).post(`/api/v1/widgets/${widgetId}/publish`).expect(422);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('UNPROCESSABLE_ENTITY');
  });

  it('GET /api/v1/widgets/:id/versions returns 404 when widget is missing', async () => {
    serviceMock.listVersions.mockRejectedValue(new NotFoundError('Widget not found'));

    const response = await request(app).get(`/api/v1/widgets/${widgetId}/versions`).expect(404);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
