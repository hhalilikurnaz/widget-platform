import { NotFoundError, UnprocessableEntityError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { widgetRepository } from '../repositories/widget.repository.js';
import { widgetVersionRepository } from '../repositories/widget-version.repository.js';
import type {
  PublishWidgetResultDto,
  RestoreVersionResultDto,
  UnpublishWidgetResultDto,
  WidgetVersionDetailDto,
  WidgetVersionSummaryDto,
} from '../types/widget-version.types.js';
import { generateEmbedToken } from '../utils/embed-token.js';
import { validateForPublish } from '../utils/publish-validator.js';
import { rethrowPrismaConflict } from '../utils/prisma-error.js';
import { cloneSchemaJson, toPublishResultDto, toUnpublishResultDto, toVersionDetailDto, toVersionSummaryDto } from '../utils/version-mapper.js';

export class WidgetVersionService {
  async publishWidget(widgetId: string): Promise<PublishWidgetResultDto> {
    const widgetRecord = await widgetVersionRepository.findWidgetWithCurrentVersion(widgetId);
    if (!widgetRecord) {
      throw new NotFoundError('Widget not found');
    }

    const slugConflict = await widgetRepository.slugExists(
      widgetRecord.workspaceId,
      widgetRecord.slug,
      widgetRecord.id,
    );

    const validation = validateForPublish({
      widget: widgetRecord,
      version: widgetRecord.currentVersion,
      slugConflict,
    });

    if (!validation.valid) {
      throw new UnprocessableEntityError('Publish validation failed', {
        errors: validation.errors,
      });
    }

    const draftVersion = widgetRecord.currentVersion;
    if (!draftVersion) {
      throw new UnprocessableEntityError('Current draft version does not exist');
    }

    const embedToken = widgetRecord.embedToken ?? (await this.generateUniqueEmbedToken());

    let result;
    try {
      result = await widgetVersionRepository.publish({
        widgetId,
        schemaJson: cloneSchemaJson(draftVersion.schemaJson),
        embedToken,
      });
    } catch (error) {
      rethrowPrismaConflict(error);
    }

    logger.info(
      {
        widgetId,
        versionId: result.publishedVersion.id,
        version: result.publishedVersion.version,
      },
      'Widget published',
    );

    return toPublishResultDto({
      widgetId,
      version: result.publishedVersion,
      embedToken,
      publishedAt: result.publishedVersion.publishedAt ?? new Date(),
    });
  }

  async unpublishWidget(widgetId: string): Promise<UnpublishWidgetResultDto> {
    const widgetRecord = await widgetVersionRepository.findWidgetWithCurrentVersion(widgetId);
    if (!widgetRecord) {
      throw new NotFoundError('Widget not found');
    }

    if (widgetRecord.status !== 'PUBLISHED') {
      throw new UnprocessableEntityError('Only published widgets can be unpublished');
    }

    await widgetVersionRepository.unpublish(widgetId);

    logger.info({ widgetId }, 'Widget unpublished');

    return toUnpublishResultDto(widgetId);
  }

  async listVersions(widgetId: string): Promise<WidgetVersionSummaryDto[]> {
    const widget = await widgetRepository.findById(widgetId);
    if (!widget) {
      throw new NotFoundError('Widget not found');
    }

    const versions = await widgetVersionRepository.getVersions(widgetId);

    return versions.map((version) => toVersionSummaryDto(version, widget.createdBy));
  }

  async getVersion(widgetId: string, versionId: string): Promise<WidgetVersionDetailDto> {
    const widget = await widgetRepository.findById(widgetId);
    if (!widget) {
      throw new NotFoundError('Widget not found');
    }

    const version = await widgetVersionRepository.getVersion(widgetId, versionId);
    if (!version) {
      throw new NotFoundError('Widget version not found');
    }

    return toVersionDetailDto(version, widgetId, widget.createdBy);
  }

  async restoreVersion(widgetId: string, versionId: string): Promise<RestoreVersionResultDto> {
    const widget = await widgetRepository.findById(widgetId);
    if (!widget) {
      throw new NotFoundError('Widget not found');
    }

    const sourceVersion = await widgetVersionRepository.getVersion(widgetId, versionId);
    if (!sourceVersion) {
      throw new NotFoundError('Widget version not found');
    }

    let result;
    try {
      result = await widgetVersionRepository.restoreVersion({
        widgetId,
        sourceVersion,
      });
    } catch (error) {
      rethrowPrismaConflict(error);
    }

    logger.info(
      {
        widgetId,
        versionId: result.draftVersion.id,
        version: result.draftVersion.version,
        restoredFromVersion: result.restoredFromVersion,
      },
      'Version restored',
    );

    return {
      widgetId,
      versionId: result.draftVersion.id,
      version: result.draftVersion.version,
      status: 'DRAFT',
      restoredFromVersion: result.restoredFromVersion,
    };
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

export const widgetVersionService = new WidgetVersionService();
