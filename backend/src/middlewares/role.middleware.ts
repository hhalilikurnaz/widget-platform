import type { MembershipRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthorizedError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { hasMinimumRole } from '../utils/permissions.js';

export function requireRole(minimumRole: MembershipRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.workspace) {
        throw new UnauthorizedError('Workspace context required');
      }

      if (!hasMinimumRole(req.workspace.role, minimumRole)) {
        logger.info(
          {
            userId: req.auth?.userId,
            workspaceId: req.workspace.id,
            role: req.workspace.role,
            requiredRole: minimumRole,
          },
          'Permission denied',
        );
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
