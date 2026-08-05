import type { WidgetSchemaDocument } from './widget-schema.types.js';

export interface PublicWidgetMetadata {
  name: string;
  slug: string;
  description: string | null;
}

export interface PublicConfigDto {
  schema: WidgetSchemaDocument;
  theme: Record<string, unknown>;
  version: number;
  publishedAt: string;
}

export interface PublicRuntimeDto {
  widget: PublicWidgetMetadata;
  version: number;
  schema: WidgetSchemaDocument;
  theme: Record<string, unknown>;
  behavior: Record<string, unknown>;
  triggers: Record<string, unknown>;
  localization: Record<string, unknown>;
  animations: Record<string, unknown>;
  runtimeVersion: string;
  embedSnippet: string;
}

export interface PublicHealthDto {
  exists: boolean;
  published: boolean;
  runtimeVersion: string;
  cacheStatus: 'enabled' | 'revalidated';
}

export interface RuntimeCacheMetadata {
  etag: string;
  lastModified: Date;
  cacheControl: string;
}

export interface PublishedRuntimeRecord {
  widget: {
    name: string;
    slug: string;
    description: string | null;
    status: 'PUBLISHED';
    updatedAt: Date;
    theme: {
      themeJson: unknown;
    } | null;
  };
  publishedVersion: {
    version: number;
    schemaJson: unknown;
    publishedAt: Date | null;
    createdAt: Date;
  };
}
