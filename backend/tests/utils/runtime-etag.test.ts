import { describe, expect, it } from 'vitest';

import { generateETag, isNotModified, buildCacheControl } from '../../src/utils/runtime-etag.js';

describe('runtime-etag', () => {
  const baseInput = {
    embedToken: 'wt_0123456789abcdef0123456789abcdef',
    version: 2,
    publishedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  it('generates stable etag values', () => {
    const etag = generateETag(baseInput);

    expect(etag).toMatch(/^"[a-f0-9]{16}"$/);
    expect(generateETag(baseInput)).toBe(etag);
  });

  it('detects matching If-None-Match headers', () => {
    const etag = generateETag(baseInput);

    expect(isNotModified(etag, etag)).toBe(true);
    expect(isNotModified('"other"', etag)).toBe(false);
  });

  it('builds cache-control header', () => {
    expect(buildCacheControl(300)).toBe('public, max-age=300');
  });
});
