import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { NotFoundError, UnprocessableEntityError } from '../src/errors/index.js';
import type { ApiErrorResponse, ApiSuccessResponse } from '../src/utils/response.js';
import type { WidgetDto } from '../src/types/widget.types.js';

const serviceMock = vi.hoisted(() => ({
  listWidgets: vi.fn(),
  getWidget: vi.fn(),
  createWidget: vi.fn(),
  updateWidget: vi.fn(),
  archiveWidget: vi.fn(),
  restoreWidget: vi.fn(),
  duplicateWidget: vi.fn(),
  deleteWidget: vi.fn(),
}));

vi.mock('../src/services/widget.service.js', () => ({
  widgetService: serviceMock,
}));

const app = createApp();

const sampleWidget: WidgetDto = {
  id: '11111111-1111-1111-1111-111111111111',
  workspaceId: '22222222-2222-2222-2222-222222222222',
  name: 'Contact Us',
  slug: 'contact-us',
  status: 'DRAFT',
  description: 'Primary contact form',
  embedToken: 'wt_demo1234567890abcdef',
  themeId: null,
  createdBy: '33333333-3333-3333-3333-333333333333',
  currentVersionId: '44444444-4444-4444-4444-444444444444',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: null,
  deletedAt: null,
};

describe('Widget API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/v1/widgets returns paginated widgets', async () => {
    serviceMock.listWidgets.mockResolvedValue({
      items: [sampleWidget],
      meta: { page: 1, limit: 25, total: 1, totalPages: 1 },
    });

    const response = await request(app)
      .get('/api/v1/widgets')
      .query({ workspaceId: sampleWidget.workspaceId })
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetDto[]> & {
      meta: { total: number };
    };

    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.meta.total).toBe(1);
  });

  it('POST /api/v1/widgets validates request body', async () => {
    const response = await request(app)
      .post('/api/v1/widgets')
      .send({ workspaceId: sampleWidget.workspaceId })
      .expect(400);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/widgets creates a widget', async () => {
    serviceMock.createWidget.mockResolvedValue(sampleWidget);

    const response = await request(app)
      .post('/api/v1/widgets')
      .send({
        workspaceId: sampleWidget.workspaceId,
        name: 'Contact Us',
        createdBy: sampleWidget.createdBy,
      })
      .expect(201);

    const body = response.body as ApiSuccessResponse<WidgetDto>;
    expect(body.data.name).toBe('Contact Us');
  });

  it('GET /api/v1/widgets/:id returns a widget', async () => {
    serviceMock.getWidget.mockResolvedValue(sampleWidget);

    const response = await request(app)
      .get(`/api/v1/widgets/${sampleWidget.id}`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetDto>;
    expect(body.data.id).toBe(sampleWidget.id);
  });

  it('PATCH /api/v1/widgets/:id updates a widget', async () => {
    serviceMock.updateWidget.mockResolvedValue({ ...sampleWidget, name: 'Updated Widget' });

    const response = await request(app)
      .patch(`/api/v1/widgets/${sampleWidget.id}`)
      .send({ name: 'Updated Widget' })
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetDto>;
    expect(body.data.name).toBe('Updated Widget');
  });

  it('POST /api/v1/widgets/:id/archive archives a widget', async () => {
    serviceMock.archiveWidget.mockResolvedValue({ ...sampleWidget, status: 'ARCHIVED' });

    const response = await request(app)
      .post(`/api/v1/widgets/${sampleWidget.id}/archive`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetDto>;
    expect(body.data.status).toBe('ARCHIVED');
  });

  it('POST /api/v1/widgets/:id/restore restores a widget', async () => {
    serviceMock.restoreWidget.mockResolvedValue({ ...sampleWidget, status: 'DRAFT' });

    const response = await request(app)
      .post(`/api/v1/widgets/${sampleWidget.id}/restore`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<WidgetDto>;
    expect(body.data.status).toBe('DRAFT');
  });

  it('POST /api/v1/widgets/:id/duplicate duplicates a widget', async () => {
    serviceMock.duplicateWidget.mockResolvedValue({
      ...sampleWidget,
      id: '55555555-5555-5555-5555-555555555555',
      slug: 'contact-us-copy',
    });

    const response = await request(app)
      .post(`/api/v1/widgets/${sampleWidget.id}/duplicate`)
      .send({ createdBy: sampleWidget.createdBy })
      .expect(201);

    const body = response.body as ApiSuccessResponse<WidgetDto>;
    expect(body.data.slug).toBe('contact-us-copy');
  });

  it('DELETE /api/v1/widgets/:id returns 204', async () => {
    serviceMock.deleteWidget.mockResolvedValue(undefined);

    await request(app).delete(`/api/v1/widgets/${sampleWidget.id}`).expect(204);
  });

  it('GET /api/v1/widgets/:id returns 404 when widget is missing', async () => {
    serviceMock.getWidget.mockRejectedValue(new NotFoundError('Widget not found'));

    const response = await request(app)
      .get(`/api/v1/widgets/${sampleWidget.id}`)
      .expect(404);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('POST /api/v1/widgets/:id/archive returns 422 when already archived', async () => {
    serviceMock.archiveWidget.mockRejectedValue(
      new UnprocessableEntityError('Widget is already archived'),
    );

    const response = await request(app)
      .post(`/api/v1/widgets/${sampleWidget.id}/archive`)
      .expect(422);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('UNPROCESSABLE_ENTITY');
  });

  it('GET /api/v1/widgets/:id rejects invalid UUID params', async () => {
    const response = await request(app).get('/api/v1/widgets/not-a-uuid').expect(400);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});
