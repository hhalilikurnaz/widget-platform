import type { Prisma, WidgetVersion } from '@prisma/client';

import type {
  PublishWidgetResultDto,
  UnpublishWidgetResultDto,
  WidgetVersionDetailDto,
  WidgetVersionSummaryDto,
} from '../types/widget-version.types.js';
import { normalizeSchemaDocument } from './schema-version.js';

const EMBED_CDN_BASE = 'https://cdn.widgetplatform.com/v1';
const API_BASE = 'https://api.widgetplatform.com/api/v1';

export function toVersionSummaryDto(
  version: WidgetVersion,
  author: string,
): WidgetVersionSummaryDto {
  return {
    id: version.id,
    version: version.version,
    published: version.published,
    publishedAt: version.publishedAt?.toISOString() ?? null,
    createdAt: version.createdAt.toISOString(),
    author,
  };
}

export function toVersionDetailDto(
  version: WidgetVersion,
  widgetId: string,
  author: string,
): WidgetVersionDetailDto {
  const schema = normalizeSchemaDocument(version.schemaJson);

  return {
    ...toVersionSummaryDto(version, author),
    widgetId,
    schema: schema as unknown as Record<string, unknown>,
  };
}

export function toPublishResultDto(input: {
  widgetId: string;
  version: WidgetVersion;
  embedToken: string;
  publishedAt: Date;
}): PublishWidgetResultDto {
  return {
    id: input.widgetId,
    status: 'PUBLISHED',
    version: input.version.version,
    versionId: input.version.id,
    embedToken: input.embedToken,
    embedSnippet: buildEmbedSnippet(input.embedToken),
    publicConfigUrl: buildPublicConfigUrl(input.embedToken),
    publishedAt: input.publishedAt.toISOString(),
  };
}

export function toUnpublishResultDto(widgetId: string): UnpublishWidgetResultDto {
  return {
    id: widgetId,
    status: 'DRAFT',
    publishedAt: null,
  };
}

export function buildEmbedSnippet(embedToken: string): string {
  return `<script src="${EMBED_CDN_BASE}/${embedToken}.js" async></script>`;
}

export function buildPublicConfigUrl(embedToken: string): string {
  return `${API_BASE}/public/widgets/${embedToken}/config`;
}

export function cloneSchemaJson(schemaJson: Prisma.JsonValue): Prisma.InputJsonValue {
  return structuredClone(schemaJson) as Prisma.InputJsonValue;
}
