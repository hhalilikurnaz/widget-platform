import type { NextFunction, Request, Response } from 'express';

import { healthService } from '../services/health.service.js';

export class HealthController {
  getHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await healthService.getHealth();
      res.status(200).json(health);
    } catch (error) {
      next(error);
    }
  };
}

export const healthController = new HealthController();
