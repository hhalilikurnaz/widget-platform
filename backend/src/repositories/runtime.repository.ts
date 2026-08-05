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
        versions: {
          where: { published: true },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    const publishedVersion = widget?.versions[0];
    if (!widget || !publishedVersion) {
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
