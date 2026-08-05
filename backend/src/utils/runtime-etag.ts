import { createHash } from 'node:crypto';

export function generateETag(input: {
  embedToken: string;
  version: number;
  publishedAt: string;
  updatedAt: string;
}): string {
  const payload = `${input.embedToken}:${String(input.version)}:${input.publishedAt}:${input.updatedAt}`;
  const hash = createHash('sha256').update(payload).digest('hex').slice(0, 16);

  return `"${hash}"`;
}

export function buildCacheControl(maxAgeSeconds: number): string {
  return `public, max-age=${String(maxAgeSeconds)}`;
}

export function isNotModified(ifNoneMatch: string | undefined, etag: string): boolean {
  if (!ifNoneMatch) {
    return false;
  }

  return ifNoneMatch.split(',').some((value) => value.trim() === etag);
}
