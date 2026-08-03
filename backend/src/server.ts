import { createServer, type Server } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase } from './database/prisma.js';
import {
  logShutdown,
  logStartup,
  logUnhandledException,
  logUnhandledRejection,
  logger,
} from './logger/index.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | undefined;

async function startServer(): Promise<void> {
  const app = createApp();

  server = createServer(app);

  await new Promise<void>((resolve, reject) => {
    server?.once('error', reject);
    server?.listen(env.PORT, () => {
      server?.off('error', reject);
      resolve();
    });
  });

  logStartup(env.PORT);
}

async function shutdown(signal: string): Promise<void> {
  logShutdown(signal);

  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExitTimer.unref();

  try {
    await new Promise<void>((resolve, reject) => {
      if (!server) {
        resolve();
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await disconnectDatabase();
    logger.info('Server shut down gracefully');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

function registerProcessHandlers(): void {
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('uncaughtException', (error: Error) => {
    logUnhandledException(error);
    void shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logUnhandledRejection(reason);
    void shutdown('unhandledRejection');
  });
}

registerProcessHandlers();

startServer().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
});
