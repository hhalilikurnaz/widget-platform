import type { Request } from 'express';

import { UnauthorizedError } from '../errors/index.js';
import type { AuthenticatedUser, WorkspaceContext } from '../types/auth.types.js';

export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.auth) {
    throw new UnauthorizedError('Authentication required');
  }

  return req.auth;
}

export function getWorkspaceContext(req: Request): WorkspaceContext {
  if (!req.workspace) {
    throw new UnauthorizedError('Workspace context required');
  }

  return req.workspace;
}

export function getWorkspaceScope(req: Request): { workspaceId: string; userId: string } {
  return {
    workspaceId: getWorkspaceContext(req).id,
    userId: getAuthenticatedUser(req).userId,
  };
}
