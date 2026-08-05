import { describe, expect, it } from 'vitest';

import { createDefaultSchema } from '../../src/utils/schema-default.js';
import { CURRENT_SCHEMA_VERSION } from '../../src/utils/schema-version.js';

describe('createDefaultSchema', () => {
  it('creates a versioned schema with all required sections', () => {
    const schema = createDefaultSchema('Contact Form');

    expect(schema).toMatchObject({
      version: CURRENT_SCHEMA_VERSION,
      content: { title: 'Contact Form', subtitle: '' },
      layout: { type: 'popup', width: '480px', alignment: 'center' },
      fields: [],
      triggers: { type: 'immediate' },
      localization: { defaultLocale: 'en', locales: {} },
      metadata: { name: 'Contact Form' },
    });
  });
});
