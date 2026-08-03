import { describe, expect, it } from 'vitest';

import {
  AppError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../src/errors/index.js';
import { validateEnv } from '../src/schemas/env.schema.js';

describe('environment validation', () => {
  it('validates required environment variables', () => {
    const env = validateEnv({
      PORT: '4000',
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    });

    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('test');
  });

  it('throws when required variables are missing', () => {
    expect(() =>
      validateEnv({
        PORT: '4000',
        NODE_ENV: 'test',
        DATABASE_URL: '',
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: '',
      }),
    ).toThrow(/Environment validation failed/);
  });
});

describe('error classes', () => {
  it('creates AppError with expected properties', () => {
    const error = new AppError(418, 'TEAPOT', 'I am a teapot');

    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.message).toBe('I am a teapot');
    expect(error.isOperational).toBe(true);
  });

  it('creates specialized error types', () => {
    expect(new ValidationError().statusCode).toBe(400);
    expect(new NotFoundError().statusCode).toBe(404);
    expect(new ConflictError().statusCode).toBe(409);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new InternalServerError().statusCode).toBe(500);
  });
});
