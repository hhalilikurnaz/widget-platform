import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundError, UnprocessableEntityError } from '../../src/errors/index.js';
import { WidgetSchemaService } from '../../src/services/widget-schema.service.js';
import { createDefaultSchema } from '../../src/utils/schema-default.js';
import { TEST_WORKSPACE_ID } from '../helpers/workspace-fixtures.js';

const repositoryMock = vi.hoisted(() => ({
  getSchema: vi.fn(),
  getCurrentVersion: vi.fn(),
  updateSchema: vi.fn(),
  resetSchema: vi.fn(),
  touchWidget: vi.fn(),
}));

const widgetRepositoryMock = vi.hoisted(() => ({
  findByIdForWorkspace: vi.fn(),
}));

vi.mock('../../src/repositories/widget-schema.repository.js', () => ({
  widgetSchemaRepository: repositoryMock,
}));

vi.mock('../../src/repositories/widget.repository.js', () => ({
  widgetRepository: widgetRepositoryMock,
}));

vi.mock('../../src/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const validSchema = createDefaultSchema('Contact Us');

describe('WidgetSchemaService', () => {
  const service = new WidgetSchemaService();

  beforeEach(() => {
    vi.clearAllMocks();
    widgetRepositoryMock.findByIdForWorkspace.mockResolvedValue({
      id: 'widget-1',
      workspaceId: TEST_WORKSPACE_ID,
    });
  });

  it('loads schema for an existing widget', async () => {
    repositoryMock.getSchema.mockResolvedValue({
      widgetId: 'widget-1',
      versionId: 'version-1',
      version: 1,
      published: false,
      schemaJson: validSchema,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.getSchema('widget-1', TEST_WORKSPACE_ID);

    expect(result.widgetId).toBe('widget-1');
    expect(result.schema.version).toBe(1);
  });

  it('throws not found when schema is missing', async () => {
    repositoryMock.getSchema.mockResolvedValue(null);

    await expect(service.getSchema('missing', TEST_WORKSPACE_ID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates draft schema after validation', async () => {
    repositoryMock.getCurrentVersion.mockResolvedValue({
      widget: { id: 'widget-1', name: 'Contact Us' },
      version: { id: 'version-1', version: 1, published: false },
    });
    repositoryMock.updateSchema.mockResolvedValue(undefined);
    repositoryMock.touchWidget.mockResolvedValue(new Date('2026-01-02T00:00:00.000Z'));

    const result = await service.updateSchema(
      'widget-1',
      TEST_WORKSPACE_ID,
      validSchema as Record<string, unknown>,
    );

    expect(result.versionId).toBe('version-1');
    expect(repositoryMock.updateSchema).toHaveBeenCalledOnce();
  });

  it('rejects updates to published schema versions', async () => {
    repositoryMock.getCurrentVersion.mockResolvedValue({
      widget: { id: 'widget-1', name: 'Contact Us' },
      version: { id: 'version-1', version: 1, published: true },
    });

    await expect(
      service.updateSchema('widget-1', TEST_WORKSPACE_ID, validSchema as Record<string, unknown>),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('rejects invalid schema updates', async () => {
    repositoryMock.getCurrentVersion.mockResolvedValue({
      widget: { id: 'widget-1', name: 'Contact Us' },
      version: { id: 'version-1', version: 1, published: false },
    });

    await expect(
      service.updateSchema('widget-1', TEST_WORKSPACE_ID, {
        version: 1,
        fields: [
          { id: 'dup', type: 'text', label: 'A' },
          { id: 'dup', type: 'email', label: 'B' },
        ],
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityError);
  });

  it('resets schema to default template', async () => {
    repositoryMock.getCurrentVersion.mockResolvedValue({
      widget: { id: 'widget-1', name: 'Contact Us' },
      version: { id: 'version-1', version: 1, published: false },
    });
    repositoryMock.resetSchema.mockResolvedValue(undefined);
    repositoryMock.touchWidget.mockResolvedValue(new Date('2026-01-03T00:00:00.000Z'));

    const result = await service.resetSchema('widget-1', TEST_WORKSPACE_ID);

    expect(result.schema.metadata).toEqual({ name: 'Contact Us' });
    expect(repositoryMock.resetSchema).toHaveBeenCalledOnce();
  });

  it('validates schema without persisting changes', () => {
    const result = service.validateSchema(validSchema as Record<string, unknown>);

    expect(result.valid).toBe(true);
    expect(repositoryMock.updateSchema).not.toHaveBeenCalled();
  });
});
