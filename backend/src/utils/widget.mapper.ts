import type { Prisma } from '@prisma/client';
import type { Widget } from '@prisma/client';

import type { WidgetDto } from '../types/widget.types.js';

export function toWidgetDto(widget: Widget): WidgetDto {
  return {
    id: widget.id,
    workspaceId: widget.workspaceId,
    name: widget.name,
    slug: widget.slug,
    status: widget.status,
    description: widget.description,
    embedToken: widget.embedToken,
    themeId: widget.themeId,
    createdBy: widget.createdBy,
    currentVersionId: widget.currentVersionId,
    createdAt: widget.createdAt.toISOString(),
    updatedAt: widget.updatedAt.toISOString(),
    publishedAt: widget.publishedAt?.toISOString() ?? null,
    deletedAt: widget.deletedAt?.toISOString() ?? null,
  };
}

export function createDefaultSchemaJson(name: string): Prisma.InputJsonValue {
  return {
    version: 1,
    metadata: { name },
    content: { title: name, subtitle: '' },
    components: [],
    behavior: {},
    triggers: {},
  };
}
