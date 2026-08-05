import { Prisma, type Widget, type WidgetVersion } from '@prisma/client';

import { prisma } from '../database/prisma.js';
import { cloneSchemaJson } from '../utils/version-mapper.js';

export interface WidgetWithCurrentVersion extends Widget {
  currentVersion: WidgetVersion | null;
}

export interface PublishResult {
  widget: Widget;
  publishedVersion: WidgetVersion;
}

export interface RestoreResult {
  widget: Widget;
  draftVersion: WidgetVersion;
  restoredFromVersion: number;
}

export class WidgetVersionRepository {
  async findWidgetWithCurrentVersion(widgetId: string): Promise<WidgetWithCurrentVersion | null> {
    return prisma.widget.findFirst({
      where: {
        id: widgetId,
        deletedAt: null,
      },
      include: {
        currentVersion: true,
      },
    });
  }

  async getMaxVersionNumber(widgetId: string): Promise<number> {
    const result = await prisma.widgetVersion.aggregate({
      where: { widgetId },
      _max: { version: true },
    });

    return result._max.version ?? 0;
  }

  async getVersions(widgetId: string): Promise<WidgetVersion[]> {
    return prisma.widgetVersion.findMany({
      where: { widgetId },
      orderBy: { version: 'desc' },
    });
  }

  async getVersion(widgetId: string, versionId: string): Promise<WidgetVersion | null> {
    return prisma.widgetVersion.findFirst({
      where: {
        id: versionId,
        widgetId,
      },
    });
  }

  async createVersion(input: {
    widgetId: string;
    version: number;
    schemaJson: Prisma.InputJsonValue;
    published?: boolean;
    publishedAt?: Date | null;
  }): Promise<WidgetVersion> {
    return prisma.widgetVersion.create({
      data: {
        widgetId: input.widgetId,
        version: input.version,
        schemaJson: input.schemaJson,
        published: input.published ?? false,
        publishedAt: input.publishedAt ?? null,
      },
    });
  }

  async publish(input: {
    widgetId: string;
    schemaJson: Prisma.InputJsonValue;
    embedToken: string;
  }): Promise<PublishResult> {
    return prisma.$transaction(async (tx) => {
      const widget = await tx.widget.findFirst({
        where: { id: input.widgetId, deletedAt: null },
        include: { currentVersion: true },
      });

      if (!widget?.currentVersion) {
        throw new Error('Widget or current version not found');
      }

      const maxVersion = await tx.widgetVersion.aggregate({
        where: { widgetId: input.widgetId },
        _max: { version: true },
      });
      const nextVersion = (maxVersion._max.version ?? 0) + 1;
      const publishedAt = new Date();

      const publishedVersion = await tx.widgetVersion.create({
        data: {
          widgetId: input.widgetId,
          version: nextVersion,
          schemaJson: input.schemaJson,
          published: true,
          publishedAt,
        },
      });

      const updatedWidget = await tx.widget.update({
        where: { id: input.widgetId },
        data: {
          status: 'PUBLISHED',
          publishedAt,
          currentVersionId: publishedVersion.id,
          embedToken: input.embedToken,
        },
      });

      return {
        widget: updatedWidget,
        publishedVersion,
      };
    });
  }

  async unpublish(widgetId: string): Promise<Widget> {
    return prisma.widget.update({
      where: { id: widgetId },
      data: {
        status: 'DRAFT',
        publishedAt: null,
      },
    });
  }

  async restoreVersion(input: {
    widgetId: string;
    sourceVersion: WidgetVersion;
  }): Promise<RestoreResult> {
    return prisma.$transaction(async (tx) => {
      const maxVersion = await tx.widgetVersion.aggregate({
        where: { widgetId: input.widgetId },
        _max: { version: true },
      });
      const nextVersion = (maxVersion._max.version ?? 0) + 1;

      const draftVersion = await tx.widgetVersion.create({
        data: {
          widgetId: input.widgetId,
          version: nextVersion,
          schemaJson: cloneSchemaJson(input.sourceVersion.schemaJson),
          published: false,
          publishedAt: null,
        },
      });

      const widget = await tx.widget.update({
        where: { id: input.widgetId },
        data: {
          status: 'DRAFT',
          currentVersionId: draftVersion.id,
        },
      });

      return {
        widget,
        draftVersion,
        restoredFromVersion: input.sourceVersion.version,
      };
    });
  }
}

export const widgetVersionRepository = new WidgetVersionRepository();
