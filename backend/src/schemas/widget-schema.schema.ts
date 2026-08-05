import { z } from 'zod';

export const widgetSchemaBodySchema = z.object({
  schema: z.record(z.unknown()),
});

export type WidgetSchemaBody = z.infer<typeof widgetSchemaBodySchema>;
