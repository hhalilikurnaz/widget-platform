import { Prisma, type Widget, type WidgetVersion } from '@prisma/client';

import { prisma } from '../database/prisma.js';

export interface CurrentVersionRecord {
  widget: Widget;
  version: WidgetVersion;
}

export interface SchemaRecord {
  widgetId: string;
  versionId: string;
  version: number;
  published: boolean;
  schemaJson: Prisma.JsonValue;
  updatedAt: Date;
}

export class WidgetSchemaRepository {
  async getCurrentVersion(widgetId: string): Promise<CurrentVersionRecord | null> {
    const widget = await prisma.widget.findFirst({
      where: {
        id: widgetId,
        deletedAt: null,
      },
      include: {
        currentVersion: true,
      },
    });

    if (!widget?.currentVersion) {
      return null;
    }

    return {
      widget,
      version: widget.currentVersion,
    };
  }

  async getSchema(widgetId: string): Promise<SchemaRecord | null> {
    const record = await this.getCurrentVersion(widgetId);
    if (!record) {
      return null;
    }

    return {
      widgetId: record.widget.id,
      versionId: record.version.id,
      version: record.version.version,
      published: record.version.published,
      schemaJson: record.version.schemaJson,
      updatedAt: record.widget.updatedAt,
    };
  }

  async updateSchema(versionId: string, schemaJson: Prisma.InputJsonValue): Promise<WidgetVersion> {
    return this.updateCurrentVersion(versionId, schemaJson);
  }

  async resetSchema(versionId: string, schemaJson: Prisma.InputJsonValue): Promise<WidgetVersion> {
    return this.updateCurrentVersion(versionId, schemaJson);
  }

  async updateCurrentVersion(
    versionId: string,
    schemaJson: Prisma.InputJsonValue,
  ): Promise<WidgetVersion> {
    return prisma.widgetVersion.update({
      where: { id: versionId },
      data: { schemaJson },
    });
  }

  async touchWidget(widgetId: string): Promise<Date> {
    const widget = await prisma.widget.update({
      where: { id: widgetId },
      data: { updatedAt: new Date() },
      select: { updatedAt: true },
    });

    return widget.updatedAt;
  }
}

export const widgetSchemaRepository = new WidgetSchemaRepository();
