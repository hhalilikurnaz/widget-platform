import type { NextFunction, Request, Response } from 'express';

import { authService } from '../services/auth.service.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    req.auth = await authService.authenticateBearerToken(req.headers.authorization);
    next();
  } catch (error) {
    next(error);
  }
}
