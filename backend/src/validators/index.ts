/**
 * Request validators re-export.
 * Widget Zod schemas live in `src/schemas/widget.schema.ts`.
 */

export {
  createWidgetBodySchema,
  duplicateWidgetBodySchema,
  listWidgetsQuerySchema,
  updateWidgetBodySchema,
  widgetIdParamsSchema,
} from '../schemas/widget.schema.js';

export { widgetSchemaBodySchema } from '../schemas/widget-schema.schema.js';
export { widgetVersionParamsSchema } from '../schemas/widget-version.schema.js';
