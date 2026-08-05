import { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { ConflictError } from '../../src/errors/index.js';
import { rethrowPrismaConflict } from '../../src/utils/prisma-error.js';

describe('rethrowPrismaConflict', () => {
  it('maps unique constraint violations to ConflictError', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '6.19.3',
    });

    expect(() => rethrowPrismaConflict(prismaError)).toThrow(ConflictError);
  });

  it('rethrows unknown errors unchanged', () => {
    const error = new Error('unexpected');

    expect(() => rethrowPrismaConflict(error)).toThrow('unexpected');
  });
});
