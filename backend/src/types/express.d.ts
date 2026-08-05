import type { Request } from 'express';

import type { AuthenticatedUser, WorkspaceContext } from './auth.types.js';
import type { Widget } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    requestId?: string;
    validatedQuery?: Record<string, unknown>;
    auth?: AuthenticatedUser;
    workspace?: WorkspaceContext;
    widget?: Widget;
  }
}

export type RequestWithId = Request & {
  requestId: string;
};

export type AuthenticatedRequest = Request & {
  auth: AuthenticatedUser;
  workspace: WorkspaceContext;
};
