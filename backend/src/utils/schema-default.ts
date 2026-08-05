import type { Prisma } from '@prisma/client';

import { CURRENT_SCHEMA_VERSION } from './schema-version.js';

export function createDefaultSchema(name: string): Prisma.InputJsonValue {
  return {
    version: CURRENT_SCHEMA_VERSION,
    content: {
      title: name,
      subtitle: '',
    },
    layout: {
      type: 'popup',
      width: '480px',
      alignment: 'center',
    },
    theme: {},
    fields: [],
    behavior: {},
    triggers: {
      type: 'immediate',
    },
    localization: {
      defaultLocale: 'en',
      locales: {},
    },
    animations: {},
    metadata: {
      name,
    },
  };
}
