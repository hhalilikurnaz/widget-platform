import cors from 'cors';
import type { RequestHandler } from 'express';

import { env } from '../config/env.js';
import { DEFAULT_CORS_ORIGIN } from '../constants/index.js';

const dashboardCors = cors({
  origin: env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Workspace-Id', 'X-Request-Id'],
});

const publicEmbedCors = cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Request-Id'],
});

export const dynamicCors: RequestHandler = (req, res, next) => {
  if (req.path.startsWith('/public')) {
    publicEmbedCors(req, res, next);
    return;
  }

  dashboardCors(req, res, next);
};
