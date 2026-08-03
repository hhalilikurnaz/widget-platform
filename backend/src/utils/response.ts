import type { Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string | null;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  message: string;
  timestamp: string;
}

export interface HealthResponse {
  success: boolean;
  version: string;
  environment: string;
  uptime: number;
  timestamp: string;
  database: string;
}

export function sendSuccess(
  res: Response,
  data: unknown,
  options?: {
    message?: string;
    statusCode?: number;
  },
): void {
  const response: ApiSuccessResponse<unknown> = {
    success: true,
    data,
    message: options?.message ?? null,
    timestamp: new Date().toISOString(),
  };

  res.status(options?.statusCode ?? 200).json(response);
}

export function sendError(
  res: Response,
  options: {
    statusCode: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  },
): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: options.code,
      message: options.message,
      ...(options.details && { details: options.details }),
    },
    message: options.message,
    timestamp: new Date().toISOString(),
  };

  res.status(options.statusCode).json(response);
}

export function getTimestamp(): string {
  return new Date().toISOString();
}
