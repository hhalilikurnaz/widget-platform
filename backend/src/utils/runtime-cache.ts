import type { Response } from 'express';

import type { RuntimeCacheMetadata } from '../types/runtime.types.js';
import { isNotModified } from './runtime-etag.js';

export interface CacheResponseResult {
  notModified: boolean;
}

export function applyCacheHeaders(res: Response, cache: RuntimeCacheMetadata): void {
  res.setHeader('ETag', cache.etag);
  res.setHeader('Cache-Control', cache.cacheControl);
  res.setHeader('Last-Modified', cache.lastModified.toUTCString());
}

export function handleConditionalGet(
  ifNoneMatch: string | undefined,
  cache: RuntimeCacheMetadata,
): CacheResponseResult {
  return {
    notModified: isNotModified(ifNoneMatch, cache.etag),
  };
}
