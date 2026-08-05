import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SubmissionRepository } from '../../src/repositories/submission.repository.js';

const txMock = vi.hoisted(() => ({
  submission: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

const prismaMock = vi.hoisted(() => ({
  submission: {
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
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof txMock) => Promise<unknown>) =>
      callback(txMock),
    );
  });

  it('createSubmissionIfNotDuplicate stores submission metadata', async () => {
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

    txMock.submission.findMany.mockResolvedValue([]);
    txMock.submission.create.mockResolvedValue(created);

    const result = await repository.createSubmissionIfNotDuplicate(
      {
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
      },
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(result).toEqual(created);
    expect(txMock.submission.create).toHaveBeenCalledOnce();
  });

  it('createSubmissionIfNotDuplicate returns duplicate when payload matches', async () => {
    txMock.submission.findMany.mockResolvedValue([
      {
        id: 'submission-old',
        payload: { email: 'john@example.com' },
      },
    ]);

    const result = await repository.createSubmissionIfNotDuplicate(
      {
        workspaceId: 'workspace-1',
        widgetId: 'widget-1',
        widgetVersionId: 'version-1',
        payload: { email: 'john@example.com' },
        ipHash: 'hashed-ip',
      },
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(result).toBe('duplicate');
    expect(txMock.submission.create).not.toHaveBeenCalled();
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
      workspaceId: 'workspace-1',
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

    await repository.deleteSubmission('workspace-1', 'widget-1', 'submission-1');

    expect(prismaMock.submission.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'submission-1',
        widgetId: 'widget-1',
        workspaceId: 'workspace-1',
        deletedAt: null,
      },
      data: {
        deletedAt: expect.any(Date) as Date,
      },
    });
  });
});
