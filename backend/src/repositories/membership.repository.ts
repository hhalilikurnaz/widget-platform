import type { Membership, MembershipRole } from '@prisma/client';

import { prisma } from '../database/prisma.js';

export interface MembershipWithWorkspace {
  membership: Membership;
  workspace: {
    id: string;
    name: string;
    slug: string;
    deletedAt: Date | null;
  };
}

export class MembershipRepository {
  async findByUserAndWorkspace(userId: string, workspaceId: string): Promise<Membership | null> {
    return prisma.membership.findFirst({
      where: {
        userId,
        workspaceId,
        workspace: {
          deletedAt: null,
        },
      },
    });
  }

  async findMembershipForUser(
    userId: string,
    workspaceId: string,
  ): Promise<MembershipWithWorkspace | null> {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        workspaceId,
        workspace: {
          deletedAt: null,
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    return {
      membership,
      workspace: membership.workspace,
    };
  }

  async listForUser(userId: string): Promise<Array<Membership & { workspace: { id: string; name: string; slug: string } }>> {
    return prisma.membership.findMany({
      where: {
        userId,
        workspace: {
          deletedAt: null,
        },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getUserRole(userId: string, workspaceId: string): Promise<MembershipRole | null> {
    const membership = await this.findByUserAndWorkspace(userId, workspaceId);
    return membership?.role ?? null;
  }
}

export const membershipRepository = new MembershipRepository();
