import { z } from 'zod';

import { EMBED_TOKEN_PATTERN } from '../constants/index.js';

export const embedTokenParamsSchema = z.object({
  embedToken: z.string().regex(EMBED_TOKEN_PATTERN, 'Invalid embed token'),
});

export type EmbedTokenParams = z.infer<typeof embedTokenParamsSchema>;
