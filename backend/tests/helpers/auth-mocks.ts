import { vi } from 'vitest';

export const TEST_USER_ID = '33333333-3333-3333-3333-333333333333';
export const TEST_WORKSPACE_ID = '22222222-2222-2222-2222-222222222222';

vi.mock('../../src/middlewares/authenticate.middleware.js', () => ({
  authenticate: (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    req.auth = {
      userId: TEST_USER_ID,
      email: 'test@example.com',
      supabaseUserId: 'supabase-user-1',
    };
    next();
  },
}));

vi.mock('../../src/middlewares/workspace.middleware.js', () => ({
  requireWorkspace: (req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    req.workspace = {
      id: TEST_WORKSPACE_ID,
      role: 'OWNER',
    };
    next();
  },
}));

vi.mock('../../src/middlewares/role.middleware.js', () => ({
  requireRole: () => (_req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    next();
  },
}));

vi.mock('../../src/middlewares/ownership.middleware.js', () => ({
  requireOwnership: () => (_req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
    next();
  },
}));
