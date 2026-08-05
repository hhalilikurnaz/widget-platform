import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundError, UnprocessableEntityError } from '../../src/errors/index.js';
import { WidgetService } from '../../src/services/widget.service.js';
import { baseWidgetRecord, TEST_WORKSPACE_ID } from '../helpers/workspace-fixtures.js';

const repositoryMock = vi.hoisted(() => ({
  findMany: vi.fn(),
  findById: vi.fn(),
  findByIdForWorkspace: vi.fn(),
  findByIdWithVersion: vi.fn(),
  findByIdWithVersionForWorkspace: vi.fn(),
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

describe('WidgetService', () => {
  const service = new WidgetService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a widget with generated slug and embed token', async () => {
    repositoryMock.slugExists.mockResolvedValue(false);
    repositoryMock.embedTokenExists.mockResolvedValue(false);
    repositoryMock.createWidget.mockResolvedValue({
      ...baseWidgetRecord,
      id: 'widget-2',
      name: 'Lead Form',
      slug: 'lead-form',
      embedToken: 'wt_newtoken1234567890abcd',
      currentVersionId: 'version-2',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const widget = await service.createWidget(TEST_WORKSPACE_ID, 'user-1', {
      name: 'Lead Form',
    });

    expect(widget.slug).toBe('lead-form');
    expect(widget.embedToken).toMatch(/^wt_/);
    expect(widget.status).toBe('DRAFT');
  });

  it('rejects archiving an already archived widget', async () => {
    repositoryMock.findByIdForWorkspace.mockResolvedValue({
      ...baseWidgetRecord,
      status: 'ARCHIVED',
    });

    await expect(service.archiveWidget(TEST_WORKSPACE_ID, 'widget-1')).rejects.toBeInstanceOf(
      UnprocessableEntityError,
    );
  });

  it('rejects restoring a non-archived widget', async () => {
    repositoryMock.findByIdForWorkspace.mockResolvedValue({
      ...baseWidgetRecord,
      status: 'DRAFT',
    });

    await expect(service.restoreWidget(TEST_WORKSPACE_ID, 'widget-1')).rejects.toBeInstanceOf(
      UnprocessableEntityError,
    );
  });

  it('throws not found when widget does not exist', async () => {
    repositoryMock.findByIdForWorkspace.mockResolvedValue(null);

    await expect(service.getWidget(TEST_WORKSPACE_ID, 'missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('duplicates a widget as draft with new identifiers', async () => {
    repositoryMock.findByIdWithVersionForWorkspace.mockResolvedValue({
      ...baseWidgetRecord,
      status: 'PUBLISHED',
      embedToken: 'wt_oldtoken1234567890abcd',
      publishedAt: new Date('2026-01-05T00:00:00.000Z'),
      currentVersion: {
        id: 'version-1',
        version: 1,
        schemaJson: { version: 1 },
      },
    });
    repositoryMock.slugExists.mockResolvedValue(false);
    repositoryMock.embedTokenExists.mockResolvedValue(false);
    repositoryMock.duplicateWidget.mockResolvedValue({
      ...baseWidgetRecord,
      id: 'widget-2',
      name: 'Contact Us (Copy)',
      slug: 'contact-us-copy',
      status: 'DRAFT',
      embedToken: 'wt_copytoken1234567890abc',
      currentVersionId: 'version-2',
      createdAt: new Date('2026-01-06T00:00:00.000Z'),
      updatedAt: new Date('2026-01-06T00:00:00.000Z'),
      publishedAt: null,
    });

    const duplicate = await service.duplicateWidget(TEST_WORKSPACE_ID, 'widget-1', 'user-1');

    expect(duplicate.id).not.toBe('widget-1');
    expect(duplicate.slug).toBe('contact-us-copy');
    expect(duplicate.status).toBe('DRAFT');
    expect(duplicate.embedToken).toMatch(/^wt_/);
  });
});
