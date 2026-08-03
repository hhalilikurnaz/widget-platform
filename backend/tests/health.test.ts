import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { APP_VERSION } from '../src/constants/index.js';
import type { ApiErrorResponse, HealthResponse } from '../src/utils/response.js';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with health status', async () => {
    const response = await request(app).get('/health').expect(200);
    const body = response.body as HealthResponse;

    expect(body).toMatchObject({
      success: true,
      version: APP_VERSION,
      environment: 'test',
      database: expect.stringMatching(/connected|not_connected/) as string,
    });
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.timestamp).toBe('string');
  });
});

describe('404 handler', () => {
  it('returns standardized not found error response', async () => {
    const response = await request(app).get('/unknown-route').expect(404);
    const body = response.body as ApiErrorResponse;

    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: expect.stringContaining('not found') as string,
      },
      message: expect.stringContaining('not found') as string,
      timestamp: expect.any(String) as string,
    });
  });
});

describe('global error handler', () => {
  it('handles operational errors with correct format', async () => {
    const response = await request(app).get('/unknown-route').expect(404);
    const body = response.body as ApiErrorResponse;

    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

afterAll(async () => {
  const { disconnectDatabase } = await import('../src/database/prisma.js');
  await disconnectDatabase();
});
