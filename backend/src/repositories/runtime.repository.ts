import type { Theme, Widget, WidgetVersion } from '@prisma/client';

import { prisma } from '../database/prisma.js';
import type { PublicConfigDto, PublicRuntimeDto } from '../types/runtime.types.js';
import { toPublicConfigDto, toPublicRuntimeDto, toPublishedRuntimeRecord } from '../utils/runtime-mapper.js';

export interface PublishedWidgetRecord {
  widget: Widget & { theme: Theme | null };
  publishedVersion: WidgetVersion;
}

export class RuntimeRepository {
  async findPublishedByEmbedToken(embedToken: string): Promise<PublishedWidgetRecord | null> {
    const widget = await prisma.widget.findFirst({
      where: {
        embedToken,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        theme: true,
      },
    });

    if (!widget) {
      return null;
    }

    const publishedVersion = await prisma.widgetVersion.findFirst({
      where: {
        widgetId: widget.id,
        published: true,
      },
      orderBy: {
        version: 'desc',
      },
    });

    if (!publishedVersion) {
      return null;
    }

    return {
      widget,
      publishedVersion,
    };
  }

  async getPublicConfig(embedToken: string): Promise<PublicConfigDto | null> {
    const record = await this.findPublishedByEmbedToken(embedToken);
    if (!record) {
      return null;
    }

    return toPublicConfigDto(toPublishedRuntimeRecord(record));
  }

  async getRuntime(embedToken: string): Promise<PublicRuntimeDto | null> {
    const record = await this.findPublishedByEmbedToken(embedToken);
    if (!record) {
      return null;
    }

    return toPublicRuntimeDto(toPublishedRuntimeRecord(record), embedToken);
  }
}

export const runtimeRepository = new RuntimeRepository();
