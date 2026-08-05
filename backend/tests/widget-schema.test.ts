import './helpers/auth-mocks.js';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { NotFoundError, UnprocessableEntityError } from '../src/errors/index.js';
import type { ApiErrorResponse, ApiSuccessResponse } from '../src/utils/response.js';
import type { WidgetSchemaDto, WidgetSchemaValidationDto } from '../src/types/widget-schema.types.js';
import { createDefaultSchema } from '../src/utils/schema-default.js';

const serviceMock = vi.hoisted(() => ({
  getSchema: vi.fn(),
  updateSchema: vi.fn(),
  resetSchema: vi.fn(),
  validateSchema: vi.fn(),
}));

vi.mock('../src/services/widget-schema.service.js', () => ({
  widgetSchemaService: serviceMock,
}));

const app = createApp();

const widgetId = '11111111-1111-1111-1111-111111111111';
const validSchema = createDefaultSchema('Contact Us');

const sampleSchemaResponse: WidgetSchemaDto = {
  widgetId,
  versionId: '22222222-2222-2222-2222-222222222222',
  version: 1,
  published: false,
  schema: validSchema as WidgetSchemaDto['schema'],
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('Widget Schema API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/v1/widgets/:id/schema returns current schema', async () => {
    serviceMock.getSchema.mockResolvedValue(sampleSchemaResponse);

    const response = await request(app).get(`/api/v1/widgets/${widgetId}/schema`).expect(200);

    const body = response.body as ApiSuccessResponse<WidgetSchemaDto>;
    expect(body.data.widgetId).toBe(widgetId);
    expect(body.data.schema.version).toBe(1);
  });

  it('PUT /api/v1/widgets/:id/schema updates schema', async () => {
    serviceMock.updateSchema.mockResolvedValue(sampleSchemaResponse);

    const response = await request(app)
      .put(`/api/v1/widgets/${widgetId}/schema`)
      .send({ schema: validSchema })
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetSchemaDto>;
    expect(body.message).toBe('Schema updated');
    expect(body.data.versionId).toBe(sampleSchemaResponse.versionId);
  });

  it('POST /api/v1/widgets/:id/schema/reset restores default schema', async () => {
    serviceMock.resetSchema.mockResolvedValue(sampleSchemaResponse);

    const response = await request(app)
      .post(`/api/v1/widgets/${widgetId}/schema/reset`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetSchemaDto>;
    expect(body.message).toBe('Schema reset');
  });

  it('POST /api/v1/widgets/:id/schema/validate returns validation result', async () => {
    serviceMock.validateSchema.mockReturnValue({ valid: true, errors: [] });

    const response = await request(app)
      .post(`/api/v1/widgets/${widgetId}/schema/validate`)
      .send({ schema: validSchema })
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetSchemaValidationDto>;
    expect(body.data.valid).toBe(true);
  });

  it('GET /api/v1/widgets/:id/schema returns 404 when missing', async () => {
    serviceMock.getSchema.mockRejectedValue(new NotFoundError('Widget schema not found'));

    const response = await request(app).get(`/api/v1/widgets/${widgetId}/schema`).expect(404);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('PUT /api/v1/widgets/:id/schema returns 422 for published schema', async () => {
    serviceMock.updateSchema.mockRejectedValue(
      new UnprocessableEntityError('Published schema versions cannot be edited'),
    );

    const response = await request(app)
      .put(`/api/v1/widgets/${widgetId}/schema`)
      .send({ schema: validSchema })
      .expect(422);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('UNPROCESSABLE_ENTITY');
  });

  it('POST /api/v1/widgets/:id/schema/validate rejects missing schema body', async () => {
    const response = await request(app)
      .post(`/api/v1/widgets/${widgetId}/schema/validate`)
      .send({})
      .expect(400);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
