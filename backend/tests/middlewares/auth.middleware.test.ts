import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../src/errors/index.js';
import { authenticate } from '../../src/middlewares/authenticate.middleware.js';
import { requireOwnership } from '../../src/middlewares/ownership.middleware.js';
import { requireRole } from '../../src/middlewares/role.middleware.js';
import { requireWorkspace } from '../../src/middlewares/workspace.middleware.js';

const authServiceMock = vi.hoisted(() => ({
  authenticateBearerToken: vi.fn(),
  resolveWorkspaceContext: vi.fn(),
}));

const widgetRepositoryMock = vi.hoisted(() => ({
  findByIdForWorkspace: vi.fn(),
}));

vi.mock('../../src/services/auth.service.js', () => ({
  authService: authServiceMock,
}));

vi.mock('../../src/repositories/widget.repository.js', () => ({
  widgetRepository: widgetRepositoryMock,
}));

function createMockResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
  } as unknown as Response;
}

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('authenticate attaches auth context on valid token', async () => {
    authServiceMock.authenticateBearerToken.mockResolvedValue({
      userId: 'user-1',
      email: 'test@example.com',
      supabaseUserId: 'sb-1',
    });

    const req = { headers: { authorization: 'Bearer valid-token' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await authenticate(req, res, next);

    expect(req.auth?.userId).toBe('user-1');
    expect(next).toHaveBeenCalledOnce();
  });

  it('requireWorkspace attaches workspace context', async () => {
    authServiceMock.resolveWorkspaceContext.mockResolvedValue({
      id: 'workspace-1',
      role: 'EDITOR',
    });

    const req = {
      auth: { userId: 'user-1', email: 'test@example.com', supabaseUserId: 'sb-1' },
      header: vi.fn().mockReturnValue('workspace-1'),
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await requireWorkspace(req, res, next);

    expect(req.workspace?.id).toBe('workspace-1');
    expect(next).toHaveBeenCalledOnce();
  });

  it('requireRole rejects insufficient permissions', () => {
    const middleware = requireRole('EDITOR');
    const req = {
      workspace: { id: 'workspace-1', role: 'VIEWER' },
      auth: { userId: 'user-1', email: 'test@example.com', supabaseUserId: 'sb-1' },
    } as Request;
    const res = createMockResponse();
    const next = vi.fn((error?: unknown) => {
      expect(error).toBeInstanceOf(ForbiddenError);
    }) as NextFunction;

    middleware(req, res, next);
  });

  it('requireOwnership returns 404 for cross-workspace widget access', async () => {
    widgetRepositoryMock.findByIdForWorkspace.mockResolvedValue(null);

    const middleware = requireOwnership();
    const req = {
      params: { id: 'widget-1' },
      workspace: { id: 'workspace-1', role: 'OWNER' },
    } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn((error?: unknown) => {
      expect(error).toBeInstanceOf(NotFoundError);
    }) as NextFunction;

    await middleware(req, res, next);
  });
});

describe('auth service errors', () => {
  it('maps missing auth header to unauthorized', async () => {
    authServiceMock.authenticateBearerToken.mockRejectedValue(
      new UnauthorizedError('Missing or invalid Authorization header'),
    );

    const req = { headers: {} } as Request;
    const res = createMockResponse();
    const next = vi.fn((error?: unknown) => {
      expect(error).toBeInstanceOf(UnauthorizedError);
    }) as NextFunction;

    await authenticate(req, res, next);
  });
});
