import { env } from '../config/env.js';
import { APP_VERSION } from '../constants/index.js';
import { checkDatabaseConnection } from '../database/prisma.js';
import type { HealthResponse } from '../utils/response.js';
import { getTimestamp } from '../utils/response.js';

export class HealthService {
  async getHealth(): Promise<HealthResponse> {
    const database = await checkDatabaseConnection();

    return {
      success: true,
      version: APP_VERSION,
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: getTimestamp(),
      database,
    };
  }
}

export const healthService = new HealthService();
