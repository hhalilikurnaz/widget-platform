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

    const result = await repository.getCurrentVersion('widget-1');

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

    const result = await repository.getSchema('widget-1');

    expect(result).toMatchObject({
      widgetId: 'widget-1',
      versionId: 'version-1',
      version: 1,
      published: false,
    });
  });

  it('updateCurrentVersion updates schemaJson', async () => {
    const updatedVersion = {
      id: 'version-1',
      schemaJson: { version: 1, fields: [{ id: 'field-1', type: 'text', label: 'Name' }] },
    };

    prismaMock.widgetVersion.update.mockResolvedValue(updatedVersion);

    const result = await repository.updateCurrentVersion('version-1', updatedVersion.schemaJson);

    expect(result.schemaJson).toEqual(updatedVersion.schemaJson);
    expect(prismaMock.widgetVersion.update).toHaveBeenCalledOnce();
  });
});
