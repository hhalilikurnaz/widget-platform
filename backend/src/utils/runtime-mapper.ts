import type { Theme, Widget, WidgetVersion } from '@prisma/client';

import { RUNTIME_VERSION } from '../constants/index.js';
import type {
  PublicConfigDto,
  PublicHealthDto,
  PublicRuntimeDto,
  PublicWidgetMetadata,
  PublishedRuntimeRecord,
  RuntimeCacheMetadata,
} from '../types/runtime.types.js';
import type { WidgetSchemaDocument } from '../types/widget-schema.types.js';
import { generateEmbedSnippet } from './embed-snippet.js';
import { buildCacheControl, generateETag } from './runtime-etag.js';
import { normalizeSchemaDocument } from './schema-version.js';

export interface PublishedWidgetSource {
  widget: Pick<Widget, 'name' | 'slug' | 'description' | 'updatedAt'> & {
    theme: Pick<Theme, 'themeJson'> | null;
  };
  publishedVersion: Pick<WidgetVersion, 'version' | 'schemaJson' | 'publishedAt' | 'createdAt'>;
}

export function toPublishedRuntimeRecord(source: PublishedWidgetSource): PublishedRuntimeRecord {
  return {
    widget: {
      name: source.widget.name,
      slug: source.widget.slug,
      description: source.widget.description,
      status: 'PUBLISHED',
      updatedAt: source.widget.updatedAt,
      theme: source.widget.theme ? { themeJson: source.widget.theme.themeJson } : null,
    },
    publishedVersion: {
      version: source.publishedVersion.version,
      schemaJson: source.publishedVersion.schemaJson,
      publishedAt: source.publishedVersion.publishedAt,
      createdAt: source.publishedVersion.createdAt,
    },
  };
}

export function toPublicWidgetMetadata(record: PublishedRuntimeRecord): PublicWidgetMetadata {
  return {
    name: record.widget.name,
    slug: record.widget.slug,
    description: record.widget.description,
  };
}

export function toPublicConfigDto(record: PublishedRuntimeRecord): PublicConfigDto {
  const schema = normalizeSchemaDocument(record.publishedVersion.schemaJson);

  return {
    schema,
    theme: resolveTheme(schema, record.widget.theme),
    version: record.publishedVersion.version,
    publishedAt: getPublishedAt(record).toISOString(),
  };
}

export function toPublicRuntimeDto(
  record: PublishedRuntimeRecord,
  embedToken: string,
): PublicRuntimeDto {
  const schema = normalizeSchemaDocument(record.publishedVersion.schemaJson);

  return {
    widget: toPublicWidgetMetadata(record),
    version: record.publishedVersion.version,
    schema,
    theme: resolveTheme(schema, record.widget.theme),
    behavior: schema.behavior,
    triggers: schema.triggers,
    localization: schema.localization,
    animations: schema.animations,
    runtimeVersion: RUNTIME_VERSION,
    embedSnippet: generateEmbedSnippet(embedToken),
  };
}

export function toPublicHealthDto(cacheStatus: PublicHealthDto['cacheStatus']): PublicHealthDto {
  return {
    exists: true,
    published: true,
    runtimeVersion: RUNTIME_VERSION,
    cacheStatus,
  };
}

export function toRuntimeCacheMetadata(
  embedToken: string,
  record: PublishedRuntimeRecord,
  maxAgeSeconds: number,
): RuntimeCacheMetadata {
  const publishedAt = getPublishedAt(record);

  return {
    etag: generateETag({
      embedToken,
      version: record.publishedVersion.version,
      publishedAt: publishedAt.toISOString(),
      updatedAt: record.widget.updatedAt.toISOString(),
    }),
    lastModified: publishedAt,
    cacheControl: buildCacheControl(maxAgeSeconds),
  };
}

function resolveTheme(
  schema: WidgetSchemaDocument,
  theme: PublishedRuntimeRecord['widget']['theme'],
): Record<string, unknown> {
  const workspaceTheme = isRecord(theme?.themeJson) ? theme.themeJson : {};

  return {
    ...workspaceTheme,
    ...schema.theme,
  };
}

function getPublishedAt(record: PublishedRuntimeRecord): Date {
  return record.publishedVersion.publishedAt ?? record.publishedVersion.createdAt;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
