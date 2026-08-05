import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundError, UnprocessableEntityError } from '../../src/errors/index.js';
import { WidgetService } from '../../src/services/widget.service.js';

const repositoryMock = vi.hoisted(() => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  findByIdWithVersion: vi.fn(),
  slugExists: vi.fn(),
  embedTokenExists: vi.fn(),
  createWidget: vi.fn(),
  updateWidget: vi.fn(),
  archiveWidget: vi.fn(),
  restoreWidget: vi.fn(),
  softDelete: vi.fn(),
  duplicateWidget: vi.fn(),
}));

vi.mock('../../src/repositories/widget.repository.js', () => ({
  widgetRepository: repositoryMock,
}));

vi.mock('../../src/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const baseWidget = {
  id: 'widget-1',
  workspaceId: 'workspace-1',
  name: 'Contact Us',
  slug: 'contact-us',
  status: 'DRAFT' as const,
  description: 'Primary contact form',
  embedToken: 'wt_demo1234567890abcdef',
  themeId: null,
  createdBy: 'user-1',
  currentVersionId: 'version-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: null,
  deletedAt: null,
};

describe('WidgetService', () => {
  const service = new WidgetService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a widget with generated slug and embed token', async () => {
    repositoryMock.slugExists.mockResolvedValue(false);
    repositoryMock.embedTokenExists.mockResolvedValue(false);
    repositoryMock.createWidget.mockResolvedValue({
      id: 'widget-2',
      workspaceId: 'workspace-1',
      name: 'Lead Form',
      slug: 'lead-form',
      status: 'DRAFT',
      description: null,
      embedToken: 'wt_newtoken1234567890abcd',
      themeId: null,
      createdBy: 'user-1',
      currentVersionId: 'version-2',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      publishedAt: null,
      deletedAt: null,
    });

    const widget = await service.createWidget({
      workspaceId: 'workspace-1',
      name: 'Lead Form',
      createdBy: 'user-1',
    });

    expect(widget.slug).toBe('lead-form');
    expect(widget.embedToken).toMatch(/^wt_/);
    expect(widget.status).toBe('DRAFT');
  });

  it('rejects archiving an already archived widget', async () => {
    repositoryMock.findById.mockResolvedValue({
      ...baseWidget,
      status: 'ARCHIVED',
      createdAt: new Date(baseWidget.createdAt),
      updatedAt: new Date(baseWidget.updatedAt),
    });

    await expect(service.archiveWidget('widget-1')).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('rejects restoring a non-archived widget', async () => {
    repositoryMock.findById.mockResolvedValue({
      ...baseWidget,
      status: 'DRAFT',
      createdAt: new Date(baseWidget.createdAt),
      updatedAt: new Date(baseWidget.updatedAt),
    });

    await expect(service.restoreWidget('widget-1')).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('throws not found when widget does not exist', async () => {
    repositoryMock.findById.mockResolvedValue(null);

    await expect(service.getWidget('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('duplicates a widget as draft with new identifiers', async () => {
    repositoryMock.findByIdWithVersion.mockResolvedValue({
      id: 'widget-1',
      workspaceId: 'workspace-1',
      name: 'Contact Us',
      slug: 'contact-us',
      status: 'PUBLISHED',
      description: 'Primary contact form',
      embedToken: 'wt_oldtoken1234567890abcd',
      themeId: null,
      createdBy: 'user-1',
      currentVersionId: 'version-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      publishedAt: new Date('2026-01-05T00:00:00.000Z'),
      deletedAt: null,
      currentVersion: {
        id: 'version-1',
        version: 1,
        schemaJson: { version: 1 },
      },
    });
    repositoryMock.slugExists.mockResolvedValue(false);
    repositoryMock.embedTokenExists.mockResolvedValue(false);
    repositoryMock.duplicateWidget.mockResolvedValue({
      id: 'widget-2',
      workspaceId: 'workspace-1',
      name: 'Contact Us (Copy)',
      slug: 'contact-us-copy',
      status: 'DRAFT',
      description: 'Primary contact form',
      embedToken: 'wt_copytoken1234567890abc',
      themeId: null,
      createdBy: 'user-1',
      currentVersionId: 'version-2',
      createdAt: new Date('2026-01-06T00:00:00.000Z'),
      updatedAt: new Date('2026-01-06T00:00:00.000Z'),
      publishedAt: null,
      deletedAt: null,
    });

    const duplicate = await service.duplicateWidget('widget-1', 'user-1');

    expect(duplicate.id).not.toBe('widget-1');
    expect(duplicate.slug).toBe('contact-us-copy');
    expect(duplicate.status).toBe('DRAFT');
    expect(duplicate.embedToken).toMatch(/^wt_/);
  });
});
