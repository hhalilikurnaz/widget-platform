import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { ConflictError, NotFoundError, ValidationError } from '../src/errors/index.js';
import type { PublicSubmitResultDto } from '../src/types/submission.types.js';
import type { SubmissionDetailDto, SubmissionListItemDto } from '../src/types/submission.types.js';
import type { ApiErrorResponse, ApiSuccessResponse } from '../src/utils/response.js';

const serviceMock = vi.hoisted(() => ({
  submitPublic: vi.fn(),
  listSubmissions: vi.fn(),
  getSubmission: vi.fn(),
  deleteSubmission: vi.fn(),
  exportSubmissions: vi.fn(),
}));

vi.mock('../src/services/submission.service.js', () => ({
  submissionService: serviceMock,
}));

const app = createApp();
const embedToken = 'wt_0123456789abcdef0123456789abcdef';
const widgetId = '11111111-1111-1111-1111-111111111111';
const submissionId = '22222222-2222-2222-2222-222222222222';

describe('Submission API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /public/widgets/:embedToken/submit returns success response', async () => {
    const result: PublicSubmitResultDto = {
      success: true,
      message: 'Thank you for your submission!',
    };
    serviceMock.submitPublic.mockResolvedValue(result);

    const response = await request(app)
      .post(`/public/widgets/${embedToken}/submit`)
      .send({
        fields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      })
      .expect(201);

    const body = response.body as ApiSuccessResponse<PublicSubmitResultDto>;
    expect(body.data.success).toBe(true);
  });

  it('POST /public/widgets/:embedToken/submit returns 404 for unpublished widget', async () => {
    serviceMock.submitPublic.mockRejectedValue(new NotFoundError('Widget not found'));

    const response = await request(app)
      .post(`/public/widgets/${embedToken}/submit`)
      .send({ fields: { email: 'john@example.com' } })
      .expect(404);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('POST /public/widgets/:embedToken/submit returns validation errors', async () => {
    serviceMock.submitPublic.mockRejectedValue(
      new ValidationError('Submission validation failed', {
        errors: [{ path: 'email', message: 'Invalid email format' }],
      }),
    );

    const response = await request(app)
      .post(`/public/widgets/${embedToken}/submit`)
      .send({ fields: { email: 'bad' } })
      .expect(400);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /public/widgets/:embedToken/submit returns 409 for duplicate submission', async () => {
    serviceMock.submitPublic.mockRejectedValue(new ConflictError('Duplicate submission detected'));

    const response = await request(app)
      .post(`/public/widgets/${embedToken}/submit`)
      .send({ fields: { email: 'john@example.com' } })
      .expect(409);

    const body = response.body as ApiErrorResponse;
    expect(body.error.code).toBe('CONFLICT');
  });

  it('GET /api/v1/widgets/:id/submissions returns paginated submissions', async () => {
    const items: SubmissionListItemDto[] = [
      {
        id: submissionId,
        widgetId,
        version: 2,
        preview: 'john@example.com',
        country: 'US',
        browser: 'Chrome',
        device: 'desktop',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    serviceMock.listSubmissions.mockResolvedValue({
      items,
      meta: { page: 1, limit: 25, total: 1, totalPages: 1 },
    });

    const response = await request(app)
      .get(`/api/v1/widgets/${widgetId}/submissions`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<SubmissionListItemDto[]>;
    expect(body.data).toHaveLength(1);
    expect(body.meta?.total).toBe(1);
  });

  it('GET /api/v1/widgets/:id/submissions/:submissionId returns submission detail', async () => {
    const detail: SubmissionDetailDto = {
      id: submissionId,
      widgetId,
      widgetName: 'Contact Us',
      version: 2,
      payload: { email: 'john@example.com' },
      country: 'US',
      browser: 'Chrome',
      device: 'desktop',
      referrer: 'https://example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    serviceMock.getSubmission.mockResolvedValue(detail);

    const response = await request(app)
      .get(`/api/v1/widgets/${widgetId}/submissions/${submissionId}`)
      .expect(200);

    const body = response.body as ApiSuccessResponse<SubmissionDetailDto>;
    expect(body.data.payload.email).toBe('john@example.com');
  });

  it('DELETE /api/v1/widgets/:id/submissions/:submissionId returns 204', async () => {
    serviceMock.deleteSubmission.mockResolvedValue(undefined);

    await request(app)
      .delete(`/api/v1/widgets/${widgetId}/submissions/${submissionId}`)
      .expect(204);
  });

  it('POST /api/v1/widgets/:id/submissions/export returns CSV', async () => {
    serviceMock.exportSubmissions.mockResolvedValue(
      'Date,Widget,Version,Payload,Country,Browser,Device\n2026-01-01T00:00:00.000Z,Contact Us,2,{},US,Chrome,desktop\n',
    );

    const response = await request(app)
      .post(`/api/v1/widgets/${widgetId}/submissions/export`)
      .send({})
      .expect(200);

    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.text).toContain('Date,Widget,Version,Payload,Country,Browser,Device');
  });
});
