import type { NextFunction, Request, Response } from 'express';

import type { EmbedTokenParams } from '../schemas/runtime.schema.js';
import { runtimeService } from '../services/runtime.service.js';
import { applyCacheHeaders, handleConditionalGet } from '../utils/runtime-cache.js';
import { sendSuccess } from '../utils/response.js';

export class RuntimeController {
  getConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { embedToken } = req.params as EmbedTokenParams;
      const { config, cache } = await runtimeService.loadConfig(embedToken);

      applyCacheHeaders(res, cache);

      const conditional = handleConditionalGet(req.headers['if-none-match'], cache);
      if (conditional.notModified) {
        res.status(304).end();
        return;
      }

      sendSuccess(res, config);
    } catch (error) {
      next(error);
    }
  };

  getRuntime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { embedToken } = req.params as EmbedTokenParams;
      const { runtime, cache } = await runtimeService.loadRuntime(embedToken);

      applyCacheHeaders(res, cache);

      const conditional = handleConditionalGet(req.headers['if-none-match'], cache);
      if (conditional.notModified) {
        res.status(304).end();
        return;
      }

      sendSuccess(res, runtime);
    } catch (error) {
      next(error);
    }
  };

  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { embedToken } = req.params as EmbedTokenParams;
      const cacheRevalidated = req.headers['if-none-match'] !== undefined;
      const health = await runtimeService.loadHealth(embedToken, cacheRevalidated);

      sendSuccess(res, health);
    } catch (error) {
      next(error);
    }
  };
}

export const runtimeController = new RuntimeController();
