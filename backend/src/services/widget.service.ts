import { NotFoundError, UnprocessableEntityError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { widgetRepository } from '../repositories/widget.repository.js';
import type {
  CreateWidgetInput,
  PaginatedWidgets,
  UpdateWidgetInput,
  WidgetDto,
  WidgetListFilters,
} from '../types/widget.types.js';
import { generateEmbedToken } from '../utils/embed-token.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { rethrowPrismaConflict } from '../utils/prisma-error.js';
import { buildUniqueSlug, slugify } from '../utils/slug.js';
import { requireWidgetInWorkspace } from '../utils/workspace-access.js';
import { toWidgetDto } from '../utils/widget.mapper.js';

export class WidgetService {
  async listWidgets(workspaceId: string, query: Omit<WidgetListFilters, 'workspaceId'>): Promise<PaginatedWidgets> {
    const pagination = parsePagination(query.page, query.limit);
    const filters: WidgetListFilters = {
      ...query,
      workspaceId,
      page: pagination.page,
      limit: pagination.limit,
    };

    const { items, total } = await widgetRepository.findMany(filters);

    return {
      items: items.map(toWidgetDto),
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async getWidget(workspaceId: string, id: string): Promise<WidgetDto> {
    const widget = await requireWidgetInWorkspace(id, workspaceId);
    return toWidgetDto(widget);
  }

  async createWidget(
    workspaceId: string,
    createdBy: string,
    input: CreateWidgetInput,
  ): Promise<WidgetDto> {
    const slug = await this.generateUniqueSlug(workspaceId, input.name);
    const embedToken = await this.generateUniqueEmbedToken();

    let widget;
    try {
      widget = await widgetRepository.createWidget({
        workspaceId,
        createdBy,
        ...input,
        slug,
        embedToken,
      });
    } catch (error) {
      rethrowPrismaConflict(error);
    }

    logger.info(
      { widgetId: widget.id, workspaceId: widget.workspaceId, slug: widget.slug },
      'Widget created',
    );

    return toWidgetDto(widget);
  }

  async updateWidget(workspaceId: string, id: string, input: UpdateWidgetInput): Promise<WidgetDto> {
    const existing = await this.getActiveWidget(workspaceId, id);
    const widget = await widgetRepository.updateWidget(existing.id, input);

    logger.info({ widgetId: widget.id, workspaceId: widget.workspaceId }, 'Widget updated');

    return toWidgetDto(widget);
  }

  async archiveWidget(workspaceId: string, id: string): Promise<WidgetDto> {
    const existing = await this.getActiveWidget(workspaceId, id);

    if (existing.status === 'ARCHIVED') {
      throw new UnprocessableEntityError('Widget is already archived');
    }

    const widget = await widgetRepository.archiveWidget(existing.id);

    logger.info({ widgetId: widget.id, workspaceId: widget.workspaceId }, 'Widget archived');

    return toWidgetDto(widget);
  }

  async restoreWidget(workspaceId: string, id: string): Promise<WidgetDto> {
    const existing = await this.getActiveWidget(workspaceId, id);

    if (existing.status !== 'ARCHIVED') {
      throw new UnprocessableEntityError('Only archived widgets can be restored');
    }

    const widget = await widgetRepository.restoreWidget(existing.id);

    logger.info({ widgetId: widget.id, workspaceId: widget.workspaceId }, 'Widget restored');

    return toWidgetDto(widget);
  }

  async duplicateWidget(workspaceId: string, id: string, createdBy: string): Promise<WidgetDto> {
    const source = await widgetRepository.findByIdWithVersionForWorkspace(id, workspaceId);
    if (!source) {
      throw new NotFoundError('Widget not found');
    }

    const slug = await this.generateUniqueSlug(workspaceId, `${source.name} copy`);
    const embedToken = await this.generateUniqueEmbedToken();

    let widget;
    try {
      widget = await widgetRepository.duplicateWidget(source, {
        slug,
        embedToken,
        createdBy,
      });
    } catch (error) {
      rethrowPrismaConflict(error);
    }

    logger.info(
      {
        widgetId: widget.id,
        sourceWidgetId: source.id,
        workspaceId: widget.workspaceId,
      },
      'Widget duplicated',
    );

    return toWidgetDto(widget);
  }

  async deleteWidget(workspaceId: string, id: string): Promise<void> {
    const existing = await this.getActiveWidget(workspaceId, id);
    await widgetRepository.softDelete(existing.id);

    logger.info({ widgetId: existing.id, workspaceId: existing.workspaceId }, 'Widget deleted');
  }

  private async getActiveWidget(workspaceId: string, id: string): Promise<WidgetDto> {
    const widget = await requireWidgetInWorkspace(id, workspaceId);
    return toWidgetDto(widget);
  }

  private async generateUniqueSlug(workspaceId: string, name: string): Promise<string> {
    const baseSlug = slugify(name) || 'widget';
    let attempt = 0;

    while (attempt < 100) {
      const candidate = buildUniqueSlug(baseSlug, attempt);
      const exists = await widgetRepository.slugExists(workspaceId, candidate);
      if (!exists) {
        return candidate;
      }
      attempt += 1;
    }

    throw new UnprocessableEntityError('Unable to generate a unique slug');
  }

  private async generateUniqueEmbedToken(): Promise<string> {
    let attempt = 0;

    while (attempt < 10) {
      const token = generateEmbedToken();
      const exists = await widgetRepository.embedTokenExists(token);
      if (!exists) {
        return token;
      }
      attempt += 1;
    }

    throw new UnprocessableEntityError('Unable to generate a unique embed token');
  }
}

export const widgetService = new WidgetService();
