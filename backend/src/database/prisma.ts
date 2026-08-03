import { PrismaClient } from '@prisma/client';

import { DATABASE_STATUS, type DatabaseStatus } from '../constants/index.js';
import { logger } from '../logger/index.js';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<DatabaseStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return DATABASE_STATUS.CONNECTED;
  } catch (error) {
    logger.warn({ err: error }, 'Database connection check failed');
    return DATABASE_STATUS.NOT_CONNECTED;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
