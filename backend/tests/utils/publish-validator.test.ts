import { describe, expect, it } from 'vitest';

import { validateForPublish } from '../../src/utils/publish-validator.js';
import { createDefaultSchema } from '../../src/utils/schema-default.js';

const baseWidget = {
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

describe('validateForPublish', () => {
  it('accepts a valid draft widget', () => {
    const result = validateForPublish({
      widget: baseWidget,
      version: draftVersion,
      slugConflict: false,
    });

    expect(result.valid).toBe(true);
  });

  it('rejects deleted widgets', () => {
    const result = validateForPublish({
      widget: { ...baseWidget, deletedAt: new Date() },
      version: draftVersion,
      slugConflict: false,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path === 'widget')).toBe(true);
  });

  it('rejects publish when current version is already published', () => {
    const result = validateForPublish({
      widget: baseWidget,
      version: { ...draftVersion, published: true },
      slugConflict: false,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path === 'version')).toBe(true);
  });

  it('rejects slug conflicts', () => {
    const result = validateForPublish({
      widget: baseWidget,
      version: draftVersion,
      slugConflict: true,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path === 'slug')).toBe(true);
  });

  it('rejects invalid schema', () => {
    const result = validateForPublish({
      widget: baseWidget,
      version: {
        ...draftVersion,
        schemaJson: {
          version: 1,
          fields: [{ id: 'dup', type: 'text', label: 'A' }, { id: 'dup', type: 'email', label: 'B' }],
        },
      },
      slugConflict: false,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path.startsWith('schema.'))).toBe(true);
  });
});
