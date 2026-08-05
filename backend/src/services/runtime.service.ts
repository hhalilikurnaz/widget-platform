import { NotFoundError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { PUBLIC_CACHE_MAX_AGE_SECONDS } from '../constants/index.js';
import { runtimeRepository, type PublishedWidgetRecord } from '../repositories/runtime.repository.js';
import type {
  PublicConfigDto,
  PublicHealthDto,
  PublicRuntimeDto,
  RuntimeCacheMetadata,
} from '../types/runtime.types.js';
import { generateEmbedSnippet } from '../utils/embed-snippet.js';
import { generateETag } from '../utils/runtime-etag.js';
import {
  toPublicConfigDto,
  toPublicHealthDto,
  toPublicRuntimeDto,
  toPublishedRuntimeRecord,
  toRuntimeCacheMetadata,
} from '../utils/runtime-mapper.js';

const NOT_FOUND_MESSAGE = 'Widget not found';

export class RuntimeService {
  async loadConfig(embedToken: string): Promise<{
    config: PublicConfigDto;
    cache: RuntimeCacheMetadata;
  }> {
    const record = await this.validatePublicAccess(embedToken);

    logger.info({ embedToken }, 'Config requested');

    return {
      config: toPublicConfigDto(toPublishedRuntimeRecord(record)),
      cache: this.generateCacheMetadata(embedToken, record),
    };
  }

  async loadRuntime(embedToken: string): Promise<{
    runtime: PublicRuntimeDto;
    cache: RuntimeCacheMetadata;
  }> {
    const record = await this.validatePublicAccess(embedToken);

    logger.info({ embedToken }, 'Runtime loaded');

    return {
      runtime: toPublicRuntimeDto(toPublishedRuntimeRecord(record), embedToken),
      cache: this.generateCacheMetadata(embedToken, record),
    };
  }

  async loadHealth(
    embedToken: string,
    cacheRevalidated: boolean,
  ): Promise<PublicHealthDto> {
    await this.validatePublicAccess(embedToken);

    logger.info({ embedToken, cacheRevalidated }, 'Health requested');

    return toPublicHealthDto(cacheRevalidated ? 'revalidated' : 'enabled');
  }

  async validatePublicAccess(embedToken: string): Promise<PublishedWidgetRecord> {
    const record = await runtimeRepository.findPublishedByEmbedToken(embedToken);

    if (!record) {
      logger.info({ embedToken }, '404 runtime');
      throw new NotFoundError(NOT_FOUND_MESSAGE);
    }

    return record;
  }

  generateEmbedSnippet(embedToken: string): string {
    return generateEmbedSnippet(embedToken);
  }

  generateETag(
    embedToken: string,
    record: PublishedWidgetRecord,
  ): string {
    const publishedAt = record.publishedVersion.publishedAt ?? record.publishedVersion.createdAt;

    return generateETag({
      embedToken,
      version: record.publishedVersion.version,
      publishedAt: publishedAt.toISOString(),
      updatedAt: record.widget.updatedAt.toISOString(),
    });
  }

  generateCacheMetadata(
    embedToken: string,
    record: PublishedWidgetRecord,
  ): RuntimeCacheMetadata {
    return toRuntimeCacheMetadata(
      embedToken,
      toPublishedRuntimeRecord(record),
      PUBLIC_CACHE_MAX_AGE_SECONDS,
    );
  }
}

export const runtimeService = new RuntimeService();
