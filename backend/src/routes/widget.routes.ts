import { Router } from 'express';

import { widgetController } from '../controllers/widget.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
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
