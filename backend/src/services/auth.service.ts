import { NotFoundError, UnauthorizedError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { membershipRepository } from '../repositories/membership.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { AuthenticatedUser, WorkspaceContext } from '../types/auth.types.js';

export class AuthService {
  async authenticateBearerToken(authorizationHeader: string | undefined): Promise<AuthenticatedUser> {
    const token = extractBearerToken(authorizationHeader);

    if (!token) {
      logger.info('Authentication failure');
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      logger.info({ reason: error.message }, 'Authentication failure');
      throw new UnauthorizedError('Invalid or expired token');
    }

    if (!data.user.email) {
      logger.info('Authentication failure');
      throw new UnauthorizedError('Invalid or expired token');
    }

    const platformUser = await userRepository.findByEmail(data.user.email);

    if (!platformUser) {
      logger.info({ email: data.user.email }, 'Authentication failure');
      throw new UnauthorizedError('User is not provisioned for this platform');
    }

    logger.info({ userId: platformUser.id }, 'Authentication success');

    return {
      userId: platformUser.id,
      email: platformUser.email,
      supabaseUserId: data.user.id,
    };
  }

  async resolveWorkspaceContext(
    userId: string,
    workspaceId: string | undefined,
  ): Promise<WorkspaceContext> {
    if (!workspaceId) {
      throw new UnauthorizedError('X-Workspace-Id header is required');
    }

    const membership = await membershipRepository.findByUserAndWorkspace(userId, workspaceId);

    if (!membership) {
      logger.info({ userId, workspaceId }, 'Workspace mismatch');
      throw new NotFoundError('Workspace not found');
    }

    return {
      id: workspaceId,
      role: membership.role,
    };
  }
}

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export const authService = new AuthService();
