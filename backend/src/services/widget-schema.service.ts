import type { Prisma, Widget } from '@prisma/client';

import { NotFoundError, UnprocessableEntityError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { widgetSchemaRepository } from '../repositories/widget-schema.repository.js';
import type {
  WidgetSchemaDocument,
  WidgetSchemaDto,
  WidgetSchemaValidationDto,
} from '../types/widget-schema.types.js';
import { createDefaultSchema } from '../utils/schema-default.js';
import { validateWidgetSchema } from '../utils/schema-validator.js';
import { normalizeSchemaDocument } from '../utils/schema-version.js';
import { ensureWidgetInWorkspace } from '../utils/workspace-access.js';

export class WidgetSchemaService {
  async getSchema(widgetId: string, workspaceId: string): Promise<WidgetSchemaDto> {
    const record = await widgetSchemaRepository.getSchema(widgetId, workspaceId);
    if (!record) {
      throw new NotFoundError('Widget schema not found');
    }

    const schema = normalizeSchemaDocument(record.schemaJson);

    logger.info(
      { widgetId, versionId: record.versionId, version: record.version },
      'Schema loaded',
    );

    return this.toSchemaDto(record, schema);
  }

  async updateSchema(
    widgetId: string,
    workspaceId: string,
    schema: Record<string, unknown>,
    preloaded?: Widget,
  ): Promise<WidgetSchemaDto> {
    const editable = await this.getEditableVersion(widgetId, workspaceId, preloaded);
    this.ensureSchemaIsValid(schema);

    const normalized = normalizeSchemaDocument(schema);
    const updatedAt = await widgetSchemaRepository.updateSchemaAndTouchWidget(
      editable.version.id,
      widgetId,
      normalized as unknown as Prisma.InputJsonValue,
    );

    logger.info(
      { widgetId, versionId: editable.version.id, version: editable.version.version },
      'Schema updated',
    );

    return {
      widgetId,
      versionId: editable.version.id,
      version: editable.version.version,
      published: editable.version.published,
      schema: normalized,
      updatedAt: updatedAt.toISOString(),
    };
  }

  async resetSchema(
    widgetId: string,
    workspaceId: string,
    preloaded?: Widget,
  ): Promise<WidgetSchemaDto> {
    const editable = await this.getEditableVersion(widgetId, workspaceId, preloaded);
    const defaultSchema = createDefaultSchema(editable.widget.name);

    const updatedAt = await widgetSchemaRepository.updateSchemaAndTouchWidget(
      editable.version.id,
      widgetId,
      defaultSchema,
    );

    logger.info(
      { widgetId, versionId: editable.version.id, version: editable.version.version },
      'Schema reset',
    );

    return {
      widgetId,
      versionId: editable.version.id,
      version: editable.version.version,
      published: editable.version.published,
      schema: normalizeSchemaDocument(defaultSchema),
      updatedAt: updatedAt.toISOString(),
    };
  }

  validateSchema(schema: Record<string, unknown>): WidgetSchemaValidationDto {
    const result = validateWidgetSchema(schema);

    logger.info(
      { valid: result.valid, errorCount: result.errors.length },
      'Schema validated',
    );

    return result;
  }

  private async getEditableVersion(widgetId: string, workspaceId: string, preloaded?: Widget) {
    await ensureWidgetInWorkspace(widgetId, workspaceId, preloaded);
    const record = await widgetSchemaRepository.getCurrentVersion(widgetId, workspaceId);
    if (!record) {
      throw new NotFoundError('Widget not found');
    }

    if (record.version.published) {
      throw new UnprocessableEntityError('Published schema versions cannot be edited');
    }

    return record;
  }

  private ensureSchemaIsValid(schema: Record<string, unknown>): void {
    const result = validateWidgetSchema(schema);
    if (!result.valid) {
      throw new UnprocessableEntityError('Schema validation failed', {
        errors: result.errors,
      });
    }
  }

  private toSchemaDto(
    record: {
      widgetId: string;
      versionId: string;
      version: number;
      published: boolean;
      updatedAt: Date;
    },
    schema: WidgetSchemaDocument,
  ): WidgetSchemaDto {
    return {
      widgetId: record.widgetId,
      versionId: record.versionId,
      version: record.version,
      published: record.published,
      schema,
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}

export const widgetSchemaService = new WidgetSchemaService();
