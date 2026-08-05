import type { MembershipRole, Widget } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  supabaseUserId: string;
}

export interface WorkspaceContext {
  id: string;
  role: MembershipRole;
}

export interface AuthContext {
  user: AuthenticatedUser;
  workspace: WorkspaceContext;
  widget?: Widget;
}

export type MinimumRole = MembershipRole;
