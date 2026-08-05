import type { MembershipRole } from '@prisma/client';

const ROLE_RANK: Record<MembershipRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function hasMinimumRole(userRole: MembershipRole, requiredRole: MembershipRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}

export function isMutationRole(role: MembershipRole): boolean {
  return hasMinimumRole(role, 'EDITOR');
}

export function isAdminRole(role: MembershipRole): boolean {
  return hasMinimumRole(role, 'ADMIN');
}
