import pino from 'pino';

import { env } from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

export function logStartup(port: number): void {
  logger.info(
    {
      port,
      environment: env.NODE_ENV,
      nodeVersion: process.version,
    },
    'Server started',
  );
}

export function logShutdown(signal: string): void {
  logger.info({ signal }, 'Received shutdown signal');
}

export function logUnhandledException(error: Error): void {
  logger.fatal({ err: error }, 'Unhandled exception');
}

export function logUnhandledRejection(reason: unknown): void {
  logger.fatal({ reason }, 'Unhandled promise rejection');
}
