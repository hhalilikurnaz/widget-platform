import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { dynamicCors } from './middlewares/cors.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { globalRateLimiter } from './middlewares/rate-limit.middleware.js';
import { apiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(compression());
  app.use(dynamicCors);
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(globalRateLimiter);

  app.use('/', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
