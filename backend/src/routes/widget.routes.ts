import { Router } from 'express';

import { widgetController } from '../controllers/widget.controller.js';
import { widgetSchemaController } from '../controllers/widget-schema.controller.js';
import { widgetVersionController } from '../controllers/widget-version.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { widgetSchemaBodySchema } from '../schemas/widget-schema.schema.js';
import { widgetVersionParamsSchema } from '../schemas/widget-version.schema.js';
import {
  createWidgetBodySchema,
  duplicateWidgetBodySchema,
  listWidgetsQuerySchema,
  updateWidgetBodySchema,
  widgetIdParamsSchema,
} from '../schemas/widget.schema.js';

const router = Router();

router.get('/', validateRequest({ query: listWidgetsQuerySchema }), widgetController.listWidgets);

router.post('/', validateRequest({ body: createWidgetBodySchema }), widgetController.createWidget);

router.get(
  '/:id/schema',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetSchemaController.getSchema,
);

router.put(
  '/:id/schema',
  validateRequest({ params: widgetIdParamsSchema, body: widgetSchemaBodySchema }),
  widgetSchemaController.updateSchema,
);

router.post(
  '/:id/schema/reset',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetSchemaController.resetSchema,
);

router.post(
  '/:id/schema/validate',
  validateRequest({ params: widgetIdParamsSchema, body: widgetSchemaBodySchema }),
  widgetSchemaController.validateSchema,
);

router.post(
  '/:id/publish',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetVersionController.publishWidget,
);

router.post(
  '/:id/unpublish',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetVersionController.unpublishWidget,
);

router.get(
  '/:id/versions',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetVersionController.listVersions,
);

router.get(
  '/:id/versions/:versionId',
  validateRequest({ params: widgetVersionParamsSchema }),
  widgetVersionController.getVersion,
);

router.post(
  '/:id/versions/:versionId/restore',
  validateRequest({ params: widgetVersionParamsSchema }),
  widgetVersionController.restoreVersion,
);

router.get('/:id', validateRequest({ params: widgetIdParamsSchema }), widgetController.getWidget);

router.patch(
  '/:id',
  validateRequest({ params: widgetIdParamsSchema, body: updateWidgetBodySchema }),
  widgetController.updateWidget,
);

router.delete(
  '/:id',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.deleteWidget,
);

router.post(
  '/:id/archive',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.archiveWidget,
);

router.post(
  '/:id/restore',
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.restoreWidget,
);

router.post(
  '/:id/duplicate',
  validateRequest({ params: widgetIdParamsSchema, body: duplicateWidgetBodySchema }),
  widgetController.duplicateWidget,
);

export { router as widgetRouter };
