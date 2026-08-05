import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const widgetVersionParamsSchema = z.object({
  id: uuidSchema,
  versionId: uuidSchema,
});

export type WidgetVersionParams = z.infer<typeof widgetVersionParamsSchema>;
