import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WidgetRepository } from '../../src/repositories/widget.repository.js';

const prismaMock = vi.hoisted(() => ({
  widget: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  widgetVersion: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../../src/database/prisma.js', () => ({
  prisma: prismaMock,
}));

describe('WidgetRepository', () => {
  const repository = new WidgetRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findMany applies workspace scoping and pagination', async () => {
    const widget = {
      id: 'widget-1',
      workspaceId: 'workspace-1',
      name: 'Contact Us',
      slug: 'contact-us',
      status: 'DRAFT',
      description: null,
      embedToken: 'wt_test',
      currentVersionId: null,
      themeId: null,
      createdBy: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: null,
      deletedAt: null,
    };

    prismaMock.$transaction.mockResolvedValue([[widget], 1]);

    const result = await repository.findMany({
      workspaceId: 'workspace-1',
      page: 1,
      limit: 25,
      sort: 'updatedAt',
      order: 'desc',
      deleted: false,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
  });

  it('slugExists returns true when slug is taken', async () => {
    prismaMock.widget.findFirst.mockResolvedValue({ id: 'widget-1' });

    const exists = await repository.slugExists('workspace-1', 'contact-us');

    expect(exists).toBe(true);
  });

  it('createWidget creates widget and initial version in a transaction', async () => {
    const createdWidget = {
      id: 'widget-1',
      workspaceId: 'workspace-1',
      name: 'New Widget',
      slug: 'new-widget',
      status: 'DRAFT',
      description: null,
      embedToken: 'wt_abc',
      currentVersionId: null,
      themeId: null,
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      deletedAt: null,
    };

    const version = { id: 'version-1' };

    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
      callback({
        widget: {
          create: vi.fn().mockResolvedValue(createdWidget),
          update: vi.fn().mockResolvedValue({ ...createdWidget, currentVersionId: version.id }),
        },
        widgetVersion: {
          create: vi.fn().mockResolvedValue(version),
        },
      } as unknown as typeof prismaMock),
    );

    const result = await repository.createWidget({
      workspaceId: 'workspace-1',
      name: 'New Widget',
      slug: 'new-widget',
      embedToken: 'wt_abc',
      createdBy: 'user-1',
    });

    expect(result.currentVersionId).toBe('version-1');
  });
});
