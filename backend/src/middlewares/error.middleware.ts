import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { AppError, InternalServerError, ValidationError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { sendError } from '../utils/response.js';

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError('Validation failed', {
      fields: error.flatten().fieldErrors,
    });
  }

  if (error instanceof Error) {
    return new InternalServerError(
      env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    );
  }

  return new InternalServerError('Internal server error');
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const appError = normalizeError(error);

  logger.error(
    {
      err: error instanceof Error ? error : undefined,
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: appError.statusCode,
      code: appError.code,
    },
    appError.message,
  );

  sendError(res, {
    statusCode: appError.statusCode,
    code: appError.code,
    message: appError.message,
    details: appError.details,
  });
}
