import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WidgetSchemaRepository } from '../../src/repositories/widget-schema.repository.js';

const prismaMock = vi.hoisted(() => ({
  widget: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  widgetVersion: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../../src/database/prisma.js', () => ({
  prisma: prismaMock,
}));

describe('WidgetSchemaRepository', () => {
  const repository = new WidgetSchemaRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCurrentVersion returns widget and current version', async () => {
    const widget = {
      id: 'widget-1',
      name: 'Contact Us',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
    };
    const version = {
      id: 'version-1',
      widgetId: 'widget-1',
      version: 1,
      schemaJson: { version: 1 },
      published: false,
    };

    prismaMock.widget.findFirst.mockResolvedValue({ ...widget, currentVersion: version });

    const result = await repository.getCurrentVersion('widget-1', 'workspace-1');

    expect(result?.version.id).toBe('version-1');
    expect(result?.widget.id).toBe('widget-1');
  });

  it('getSchema maps current version schema', async () => {
    prismaMock.widget.findFirst.mockResolvedValue({
      id: 'widget-1',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      deletedAt: null,
      currentVersion: {
        id: 'version-1',
        version: 1,
        schemaJson: { version: 1, fields: [] },
        published: false,
      },
    });

    const result = await repository.getSchema('widget-1', 'workspace-1');

    expect(result).toMatchObject({
      widgetId: 'widget-1',
      versionId: 'version-1',
      version: 1,
      published: false,
    });
  });

  it('updateSchemaAndTouchWidget updates schema and widget timestamp atomically', async () => {
    const schemaJson = { version: 1, fields: [{ id: 'field-1', type: 'text', label: 'Name' }] };
    const updatedAt = new Date('2026-01-03T00:00:00.000Z');

    prismaMock.$transaction.mockResolvedValue([{ id: 'version-1' }, { updatedAt }]);

    const result = await repository.updateSchemaAndTouchWidget('version-1', 'widget-1', schemaJson);

    expect(result).toEqual(updatedAt);
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
  });
});
