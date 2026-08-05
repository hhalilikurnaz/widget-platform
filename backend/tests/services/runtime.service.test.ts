import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotFoundError } from '../../src/errors/index.js';
import { RuntimeService } from '../../src/services/runtime.service.js';
import { createDefaultSchema } from '../../src/utils/schema-default.js';

const repositoryMock = vi.hoisted(() => ({
  findPublishedByEmbedToken: vi.fn(),
}));

vi.mock('../../src/repositories/runtime.repository.js', () => ({
  runtimeRepository: repositoryMock,
}));

vi.mock('../../src/logger/index.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const embedToken = 'wt_0123456789abcdef0123456789abcdef';

const publishedRecord = {
  widget: {
    id: 'widget-1',
    name: 'Contact Us',
    slug: 'contact-us',
    description: 'Help',
    status: 'PUBLISHED' as const,
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    theme: null,
  },
  publishedVersion: {
    id: 'version-2',
    version: 2,
    schemaJson: createDefaultSchema('Contact Us'),
    published: true,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
  },
};

describe('RuntimeService', () => {
  const service = new RuntimeService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads public config for published widget', async () => {
    repositoryMock.findPublishedByEmbedToken.mockResolvedValue(publishedRecord);

    const result = await service.loadConfig(embedToken);

    expect(result.config.version).toBe(2);
    expect(result.cache.etag).toMatch(/^"/);
  });

  it('loads runtime payload without internal ids', async () => {
    repositoryMock.findPublishedByEmbedToken.mockResolvedValue(publishedRecord);

    const result = await service.loadRuntime(embedToken);

    expect(result.runtime.widget.name).toBe('Contact Us');
    expect(result.runtime.runtimeVersion).toBe('1.0.0');
    expect(result.runtime).not.toHaveProperty('workspaceId');
    expect(result.runtime).not.toHaveProperty('createdBy');
  });

  it('throws not found for invalid embed token', async () => {
    repositoryMock.findPublishedByEmbedToken.mockResolvedValue(null);

    await expect(service.loadRuntime('wt_missingtoken123456789012345678')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns health status for published widget', async () => {
    repositoryMock.findPublishedByEmbedToken.mockResolvedValue(publishedRecord);

    const health = await service.loadHealth(embedToken, false);

    expect(health.exists).toBe(true);
    expect(health.published).toBe(true);
    expect(health.cacheStatus).toBe('enabled');
  });

  it('generates deterministic etag values', () => {
    const etag = service.generateETag(embedToken, publishedRecord);

    expect(etag).toBe(service.generateETag(embedToken, publishedRecord));
  });
});
