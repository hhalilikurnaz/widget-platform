import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundError, UnprocessableEntityError } from '../../src/errors/index.js';
import { WidgetVersionService } from '../../src/services/widget-version.service.js';
import { createDefaultSchema } from '../../src/utils/schema-default.js';

const widgetRepositoryMock = vi.hoisted(() => ({
  slugExists: vi.fn(),
  embedTokenExists: vi.fn(),
  findById: vi.fn(),
}));

const versionRepositoryMock = vi.hoisted(() => ({
  findWidgetWithCurrentVersion: vi.fn(),
  publish: vi.fn(),
  unpublish: vi.fn(),
  getVersions: vi.fn(),
  getVersion: vi.fn(),
  restoreVersion: vi.fn(),
}));

vi.mock('../../src/repositories/widget.repository.js', () => ({
  widgetRepository: widgetRepositoryMock,
}));

vi.mock('../../src/repositories/widget-version.repository.js', () => ({
  widgetVersionRepository: versionRepositoryMock,
}));

vi.mock('../../src/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const widget = {
  id: 'widget-1',
  workspaceId: 'workspace-1',
  name: 'Contact Us',
  slug: 'contact-us',
  status: 'DRAFT' as const,
  description: null,
  embedToken: null,
  currentVersionId: 'version-1',
  themeId: null,
  createdBy: 'user-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  publishedAt: null,
  deletedAt: null,
};

const draftVersion = {
  id: 'version-1',
  widgetId: 'widget-1',
  version: 1,
  schemaJson: createDefaultSchema('Contact Us'),
  published: false,
  publishedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('WidgetVersionService', () => {
  const service = new WidgetVersionService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes a valid draft widget', async () => {
    versionRepositoryMock.findWidgetWithCurrentVersion.mockResolvedValue({
      ...widget,
      currentVersion: draftVersion,
    });
    widgetRepositoryMock.slugExists.mockResolvedValue(false);
    widgetRepositoryMock.embedTokenExists.mockResolvedValue(false);
    versionRepositoryMock.publish.mockResolvedValue({
      widget: { ...widget, status: 'PUBLISHED', embedToken: 'wt_newtoken1234567890abcd' },
      publishedVersion: {
        ...draftVersion,
        id: 'version-2',
        version: 2,
        published: true,
        publishedAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    });

    const result = await service.publishWidget('widget-1');

    expect(result.status).toBe('PUBLISHED');
    expect(result.version).toBe(2);
    expect(result.embedToken).toMatch(/^wt_/);
  });

  it('rejects publish when widget is missing', async () => {
    versionRepositoryMock.findWidgetWithCurrentVersion.mockResolvedValue(null);

    await expect(service.publishWidget('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects publish when validation fails', async () => {
    versionRepositoryMock.findWidgetWithCurrentVersion.mockResolvedValue({
      ...widget,
      currentVersion: { ...draftVersion, published: true },
    });
    widgetRepositoryMock.slugExists.mockResolvedValue(false);

    await expect(service.publishWidget('widget-1')).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('unpublishes a published widget', async () => {
    versionRepositoryMock.findWidgetWithCurrentVersion.mockResolvedValue({
      ...widget,
      status: 'PUBLISHED',
      currentVersion: { ...draftVersion, published: true },
    });
    versionRepositoryMock.unpublish.mockResolvedValue({ ...widget, status: 'DRAFT' });

    const result = await service.unpublishWidget('widget-1');

    expect(result.status).toBe('DRAFT');
    expect(result.publishedAt).toBeNull();
  });

  it('lists version history', async () => {
    widgetRepositoryMock.findById.mockResolvedValue(widget);
    versionRepositoryMock.getVersions.mockResolvedValue([
      { ...draftVersion, version: 2, published: true },
      draftVersion,
    ]);

    const versions = await service.listVersions('widget-1');

    expect(versions).toHaveLength(2);
    expect(versions[0].author).toBe('user-1');
  });

  it('restores a version as a new draft', async () => {
    widgetRepositoryMock.findById.mockResolvedValue(widget);
    versionRepositoryMock.getVersion.mockResolvedValue({
      ...draftVersion,
      id: 'version-2',
      version: 2,
      published: true,
    });
    versionRepositoryMock.restoreVersion.mockResolvedValue({
      widget: { ...widget, status: 'DRAFT' },
      draftVersion: { ...draftVersion, id: 'version-3', version: 3, published: false },
      restoredFromVersion: 2,
    });

    const result = await service.restoreVersion('widget-1', 'version-2');

    expect(result.status).toBe('DRAFT');
    expect(result.version).toBe(3);
    expect(result.restoredFromVersion).toBe(2);
  });
});
