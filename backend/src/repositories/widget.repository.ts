import { Prisma, type Widget } from '@prisma/client';

import { prisma } from '../database/prisma.js';
import type { CreateWidgetInput, UpdateWidgetInput, WidgetListFilters } from '../types/widget.types.js';
import { paginationSkip } from '../utils/pagination.js';
import { createDefaultSchemaJson } from '../utils/widget.mapper.js';

export interface WidgetWithVersion extends Widget {
  currentVersion: {
    id: string;
    version: number;
    schemaJson: Prisma.JsonValue;
  } | null;
}

export class WidgetRepository {
  async findMany(filters: WidgetListFilters): Promise<{ items: Widget[]; total: number }> {
    const where = this.buildListWhere(filters);
    const orderBy = { [filters.sort]: filters.order } as Prisma.WidgetOrderByWithRelationInput;

    const [items, total] = await prisma.$transaction([
      prisma.widget.findMany({
        where,
        orderBy,
        skip: paginationSkip(filters.page, filters.limit),
        take: filters.limit,
      }),
      prisma.widget.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string, includeDeleted = false): Promise<Widget | null> {
    return prisma.widget.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findByIdWithVersion(id: string, includeDeleted = false): Promise<WidgetWithVersion | null> {
    return prisma.widget.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        currentVersion: {
          select: {
            id: true,
            version: true,
            schemaJson: true,
          },
        },
      },
    });
  }

  async slugExists(workspaceId: string, slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.widget.findFirst({
      where: {
        workspaceId,
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    return existing !== null;
  }

  async embedTokenExists(embedToken: string): Promise<boolean> {
    const existing = await prisma.widget.findFirst({
      where: { embedToken },
      select: { id: true },
    });

    return existing !== null;
  }

  async createWidget(input: CreateWidgetInput & { slug: string; embedToken: string }): Promise<Widget> {
    return prisma.$transaction(async (tx) => {
      const widget = await tx.widget.create({
        data: {
          workspaceId: input.workspaceId,
          name: input.name,
          slug: input.slug,
          description: input.description,
          themeId: input.themeId,
          createdBy: input.createdBy,
          embedToken: input.embedToken,
          status: 'DRAFT',
        },
      });

      const version = await tx.widgetVersion.create({
        data: {
          widgetId: widget.id,
          version: 1,
          schemaJson: createDefaultSchemaJson(input.name),
          published: false,
        },
      });

      return tx.widget.update({
        where: { id: widget.id },
        data: { currentVersionId: version.id },
      });
    });
  }

  async updateWidget(id: string, input: UpdateWidgetInput): Promise<Widget> {
    return prisma.widget.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.themeId !== undefined ? { themeId: input.themeId } : {}),
      },
    });
  }

  async archiveWidget(id: string): Promise<Widget> {
    return prisma.widget.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async restoreWidget(id: string): Promise<Widget> {
    return prisma.widget.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }

  async softDelete(id: string): Promise<Widget> {
    return prisma.widget.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async duplicateWidget(
    source: WidgetWithVersion,
    input: { slug: string; embedToken: string; createdBy: string },
  ): Promise<Widget> {
    return prisma.$transaction(async (tx) => {
      const widget = await tx.widget.create({
        data: {
          workspaceId: source.workspaceId,
          name: `${source.name} (Copy)`,
          slug: input.slug,
          description: source.description,
          themeId: source.themeId,
          createdBy: input.createdBy,
          embedToken: input.embedToken,
          status: 'DRAFT',
        },
      });

      const version = await tx.widgetVersion.create({
        data: {
          widgetId: widget.id,
          version: 1,
          schemaJson: source.currentVersion?.schemaJson ?? createDefaultSchemaJson(widget.name),
          published: false,
        },
      });

      return tx.widget.update({
        where: { id: widget.id },
        data: { currentVersionId: version.id },
      });
    });
  }

  private buildListWhere(filters: WidgetListFilters): Prisma.WidgetWhereInput {
    const where: Prisma.WidgetWhereInput = {
      workspaceId: filters.workspaceId,
      deletedAt: filters.deleted ? { not: null } : null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.themeId) {
      where.themeId = filters.themeId;
    }

    if (filters.createdBy) {
      where.createdBy = filters.createdBy;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

export const widgetRepository = new WidgetRepository();
