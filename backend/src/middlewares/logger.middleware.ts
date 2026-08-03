import { randomUUID } from 'node:crypto';

import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';

import { logger } from '../logger/index.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: Request, res: Response) => {
    const existingId = req.headers['x-request-id'];
    const requestId =
      typeof existingId === 'string' && existingId.length > 0 ? existingId : randomUUID();

    res.setHeader('X-Request-Id', requestId);
    req.requestId = requestId;

    return requestId;
  },
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (err ?? res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} completed with status ${String(res.statusCode)}`;
  },
  customErrorMessage: (req: Request, res: Response, err: Error) => {
    return `${req.method} ${req.url} failed with status ${String(res.statusCode)}: ${err.message}`;
  },
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration_ms',
  },
});
