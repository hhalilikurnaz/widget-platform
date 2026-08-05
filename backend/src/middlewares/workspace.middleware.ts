import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../errors/index.js';
import { authService } from '../services/auth.service.js';
import { WORKSPACE_HEADER } from '../constants/index.js';

export async function requireWorkspace(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth) {
      throw new UnauthorizedError('Authentication required');
    }

    const workspaceId = req.header(WORKSPACE_HEADER) ?? undefined;
    req.workspace = await authService.resolveWorkspaceContext(req.auth.userId, workspaceId);
    next();
  } catch (error) {
    next(error);
  }
}
