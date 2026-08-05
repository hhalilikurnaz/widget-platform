import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WidgetVersionRepository } from '../../src/repositories/widget-version.repository.js';

const prismaMock = vi.hoisted(() => ({
  widget: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  widgetVersion: {
    aggregate: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../../src/database/prisma.js', () => ({
  prisma: prismaMock,
}));

describe('WidgetVersionRepository', () => {
  const repository = new WidgetVersionRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getVersions returns versions ordered by version desc', async () => {
    prismaMock.widgetVersion.findMany.mockResolvedValue([
      { id: 'v2', version: 2 },
      { id: 'v1', version: 1 },
    ]);

    const versions = await repository.getVersions('widget-1');

    expect(versions).toHaveLength(2);
    expect(prismaMock.widgetVersion.findMany).toHaveBeenCalledWith({
      where: { widgetId: 'widget-1' },
      orderBy: { version: 'desc' },
    });
  });

  it('createVersion creates a version record', async () => {
    prismaMock.widgetVersion.create.mockResolvedValue({
      id: 'version-2',
      widgetId: 'widget-1',
      version: 2,
      published: false,
    });

    const version = await repository.createVersion({
      widgetId: 'widget-1',
      version: 2,
      schemaJson: { version: 1 },
    });

    expect(version.version).toBe(2);
  });

  it('publish creates immutable version and updates widget in a transaction', async () => {
    const publishedVersion = {
      id: 'version-2',
      widgetId: 'widget-1',
      version: 2,
      published: true,
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
      callback({
        widget: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'widget-1',
            currentVersion: { id: 'version-1', version: 1, schemaJson: { version: 1 } },
          }),
          update: vi.fn().mockResolvedValue({
            id: 'widget-1',
            status: 'PUBLISHED',
            embedToken: 'wt_test',
          }),
        },
        widgetVersion: {
          aggregate: vi.fn().mockResolvedValue({ _max: { version: 1 } }),
          create: vi.fn().mockResolvedValue(publishedVersion),
        },
      } as unknown as typeof prismaMock),
    );

    const result = await repository.publish({
      widgetId: 'widget-1',
      schemaJson: { version: 1 },
      embedToken: 'wt_test',
    });

    expect(result.publishedVersion.version).toBe(2);
    expect(result.publishedVersion.published).toBe(true);
  });
});
