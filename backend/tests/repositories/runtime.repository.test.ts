import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RuntimeRepository } from '../../src/repositories/runtime.repository.js';
import { createDefaultSchema } from '../../src/utils/schema-default.js';

const prismaMock = vi.hoisted(() => ({
  widget: {
    findFirst: vi.fn(),
  },
  widgetVersion: {
    findFirst: vi.fn(),
  },
}));

vi.mock('../../src/database/prisma.js', () => ({
  prisma: prismaMock,
}));

describe('RuntimeRepository', () => {
  const repository = new RuntimeRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('findPublishedByEmbedToken returns widget with latest published version', async () => {
    prismaMock.widget.findFirst.mockResolvedValue({
      id: 'widget-1',
      name: 'Contact Us',
      slug: 'contact-us',
      description: null,
      status: 'PUBLISHED',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      theme: null,
    });
    prismaMock.widgetVersion.findFirst.mockResolvedValue({
      id: 'version-2',
      version: 2,
      schemaJson: createDefaultSchema('Contact Us'),
      published: true,
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const record = await repository.findPublishedByEmbedToken('wt_testtoken123456789012345678');

    expect(record?.publishedVersion.version).toBe(2);
    expect(prismaMock.widgetVersion.findFirst).toHaveBeenCalledWith({
      where: { widgetId: 'widget-1', published: true },
      orderBy: { version: 'desc' },
    });
  });

  it('getPublicConfig returns null for missing widgets', async () => {
    prismaMock.widget.findFirst.mockResolvedValue(null);

    const config = await repository.getPublicConfig('wt_missingtoken123456789012345678');

    expect(config).toBeNull();
  });

  it('getRuntime returns public runtime payload', async () => {
    prismaMock.widget.findFirst.mockResolvedValue({
      id: 'widget-1',
      name: 'Contact Us',
      slug: 'contact-us',
      description: 'Help',
      status: 'PUBLISHED',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      theme: null,
    });
    prismaMock.widgetVersion.findFirst.mockResolvedValue({
      id: 'version-2',
      version: 2,
      schemaJson: createDefaultSchema('Contact Us'),
      published: true,
      publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const runtime = await repository.getRuntime('wt_testtoken123456789012345678');

    expect(runtime?.version).toBe(2);
    expect(runtime?.widget.name).toBe('Contact Us');
    expect(runtime?.embedSnippet).toContain('WidgetPlatform.init');
  });
});
