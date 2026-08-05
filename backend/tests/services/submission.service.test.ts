import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConflictError, NotFoundError, ValidationError } from '../../src/errors/index.js';
import { SubmissionService } from '../../src/services/submission.service.js';
import type { Prisma } from '@prisma/client';

const runtimeRepositoryMock = vi.hoisted(() => ({
  findPublishedByEmbedToken: vi.fn(),
}));

const submissionRepositoryMock = vi.hoisted(() => ({
  createSubmission: vi.fn(),
  findRecentDuplicate: vi.fn(),
  findSubmissions: vi.fn(),
  findSubmission: vi.fn(),
  deleteSubmission: vi.fn(),
  exportSubmissions: vi.fn(),
}));

const widgetRepositoryMock = vi.hoisted(() => ({
  findById: vi.fn(),
}));

vi.mock('../../src/repositories/runtime.repository.js', () => ({
  runtimeRepository: runtimeRepositoryMock,
}));

vi.mock('../../src/repositories/submission.repository.js', () => ({
  submissionRepository: submissionRepositoryMock,
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

const embedToken = 'wt_0123456789abcdef0123456789abcdef';

function buildContactSchema(): Prisma.InputJsonValue {
  return {
    version: 1,
    content: { title: 'Contact Us', subtitle: '' },
    layout: { type: 'popup', width: '480px', alignment: 'center' },
    theme: {},
    fields: [
      { id: 'name', type: 'text', label: 'Name', required: true },
      { id: 'email', type: 'email', label: 'Email', required: true },
      { id: 'message', type: 'textarea', label: 'Message', required: true },
    ],
    behavior: {},
    triggers: { type: 'immediate' },
    localization: { defaultLocale: 'en', locales: {} },
    animations: {},
    metadata: { name: 'Contact Us' },
  };
}

describe('SubmissionService', () => {
  const service = new SubmissionService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores a valid public submission against the published version', async () => {
    const schema = buildContactSchema();
    runtimeRepositoryMock.findPublishedByEmbedToken.mockResolvedValue({
      widget: {
        id: 'widget-1',
        workspaceId: 'workspace-1',
      },
      publishedVersion: {
        id: 'version-2',
        version: 2,
        schemaJson: schema,
      },
    });
    submissionRepositoryMock.findRecentDuplicate.mockResolvedValue(null);
    submissionRepositoryMock.createSubmission.mockResolvedValue({
      id: 'submission-1',
    });

    const result = await service.submitPublic(
      embedToken,
      {
        fields: {
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello',
        },
      },
      { ipAddress: '127.0.0.1' },
    );

    expect(result.success).toBe(true);
    expect(submissionRepositoryMock.createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({
        widgetId: 'widget-1',
        widgetVersionId: 'version-2',
        ipHash: expect.stringMatching(/^[a-f0-9]{64}$/) as string,
      }),
    );
  });

  it('rejects submissions for unpublished widgets', async () => {
    runtimeRepositoryMock.findPublishedByEmbedToken.mockResolvedValue(null);

    await expect(
      service.submitPublic(embedToken, { fields: {} }, { ipAddress: '127.0.0.1' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects invalid payloads', async () => {
    const schema = buildContactSchema();
    runtimeRepositoryMock.findPublishedByEmbedToken.mockResolvedValue({
      widget: {
        id: 'widget-1',
        workspaceId: 'workspace-1',
      },
      publishedVersion: {
        id: 'version-2',
        version: 2,
        schemaJson: schema,
      },
    });

    await expect(
      service.submitPublic(
        embedToken,
        {
          fields: {
            unknown: 'field',
          },
        },
        { ipAddress: '127.0.0.1' },
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects duplicate submissions', async () => {
    const schema = buildContactSchema();
    runtimeRepositoryMock.findPublishedByEmbedToken.mockResolvedValue({
      widget: {
        id: 'widget-1',
        workspaceId: 'workspace-1',
      },
      publishedVersion: {
        id: 'version-2',
        version: 2,
        schemaJson: schema,
      },
    });
    submissionRepositoryMock.findRecentDuplicate.mockResolvedValue({ id: 'submission-old' });

    await expect(
      service.submitPublic(
        embedToken,
        {
          fields: {
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Hello',
          },
        },
        { ipAddress: '127.0.0.1' },
      ),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('lists submissions for an existing widget', async () => {
    widgetRepositoryMock.findById.mockResolvedValue({ id: 'widget-1' });
    submissionRepositoryMock.findSubmissions.mockResolvedValue({
      items: [
        {
          id: 'submission-1',
          widgetId: 'widget-1',
          payload: { email: 'john@example.com' },
          country: 'US',
          browser: 'Chrome',
          device: 'desktop',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          widgetVersion: { version: 2 },
        },
      ],
      total: 1,
    });

    const result = await service.listSubmissions('widget-1', {
      page: 1,
      limit: 25,
      sort: 'createdAt',
      order: 'desc',
    });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});
