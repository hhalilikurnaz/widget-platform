import { Prisma } from '@prisma/client';

import { ConflictError } from '../errors/index.js';

export function rethrowPrismaConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictError('A widget with this slug or embed token already exists');
  }

  throw error;
}
