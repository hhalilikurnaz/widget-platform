import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SubmissionRepository } from '../../src/repositories/submission.repository.js';

const prismaMock = vi.hoisted(() => ({
  submission: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
}));

vi.mock('../../src/database/prisma.js', () => ({
  prisma: prismaMock,
}));

describe('SubmissionRepository', () => {
  const repository = new SubmissionRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createSubmission stores submission metadata', async () => {
    const created = {
      id: 'submission-1',
      workspaceId: 'workspace-1',
      widgetId: 'widget-1',
      widgetVersionId: 'version-1',
      payload: { email: 'john@example.com' },
      country: 'US',
      browser: 'Chrome',
      device: 'desktop',
      userAgent: 'Mozilla/5.0',
      referrer: 'https://example.com',
      ipHash: 'hashed-ip',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
    };

    prismaMock.submission.create.mockResolvedValue(created);

    const result = await repository.createSubmission({
      workspaceId: 'workspace-1',
      widgetId: 'widget-1',
      widgetVersionId: 'version-1',
      payload: { email: 'john@example.com' },
      country: 'US',
      browser: 'Chrome',
      device: 'desktop',
      userAgent: 'Mozilla/5.0',
      referrer: 'https://example.com',
      ipHash: 'hashed-ip',
    });

    expect(result.id).toBe('submission-1');
    expect(prismaMock.submission.create).toHaveBeenCalledOnce();
  });

  it('findSubmissions applies pagination and filters', async () => {
    const submission = {
      id: 'submission-1',
      workspaceId: 'workspace-1',
      widgetId: 'widget-1',
      widgetVersionId: 'version-1',
      payload: { email: 'john@example.com' },
      country: 'US',
      browser: 'Chrome',
      device: 'desktop',
      userAgent: null,
      referrer: null,
      ipHash: 'hash',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
      widgetVersion: { version: 2 },
    };

    prismaMock.$transaction.mockResolvedValue([[submission], 1]);

    const result = await repository.findSubmissions({
      widgetId: 'widget-1',
      page: 1,
      limit: 25,
      sort: 'createdAt',
      order: 'desc',
      country: 'US',
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('deleteSubmission soft deletes by setting deletedAt', async () => {
    prismaMock.submission.updateMany.mockResolvedValue({ count: 1 });

    await repository.deleteSubmission('widget-1', 'submission-1');

    expect(prismaMock.submission.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'submission-1',
        widgetId: 'widget-1',
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date) as Date,
      },
    });
  });
});
