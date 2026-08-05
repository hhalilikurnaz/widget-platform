import { describe, expect, it } from 'vitest';

import { buildUniqueSlug, slugify } from '../../src/utils/slug.js';

describe('slug utils', () => {
  it('slugify converts names to kebab-case', () => {
    expect(slugify('Contact Us')).toBe('contact-us');
    expect(slugify('  Lead Form!!! ')).toBe('lead-form');
  });

  it('buildUniqueSlug appends suffix after first collision', () => {
    expect(buildUniqueSlug('contact-us', 0)).toBe('contact-us');
    expect(buildUniqueSlug('contact-us', 2)).toBe('contact-us-2');
  });
});
