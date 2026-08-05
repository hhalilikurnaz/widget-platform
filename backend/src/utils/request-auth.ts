import type { Request } from 'express';
import type { Widget } from '@prisma/client';

import { UnauthorizedError } from '../errors/index.js';
import type { AuthenticatedUser, WorkspaceContext } from '../types/auth.types.js';
import { getPreloadedWidget } from './workspace-access.js';

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

export function getWorkspaceScope(req: Request): {
  workspaceId: string;
  userId: string;
  widget?: Widget;
} {
  return {
    workspaceId: getWorkspaceContext(req).id,
    userId: getAuthenticatedUser(req).userId,
    widget: req.widget,
  };
}

export function getWidgetScope(
  req: Request,
  widgetId: string,
): {
  workspaceId: string;
  userId: string;
  widget?: Widget;
} {
  const scope = getWorkspaceScope(req);
  return {
    ...scope,
    widget: getPreloadedWidget(req, widgetId, scope.workspaceId) ?? scope.widget,
  };
}
