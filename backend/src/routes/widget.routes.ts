import { Router } from 'express';

import { analyticsController } from '../controllers/analytics.controller.js';
import { submissionController } from '../controllers/submission.controller.js';
import { widgetController } from '../controllers/widget.controller.js';
import { widgetSchemaController } from '../controllers/widget-schema.controller.js';
import { widgetVersionController } from '../controllers/widget-version.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { requireOwnership } from '../middlewares/ownership.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { requireWorkspace } from '../middlewares/workspace.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  analyticsQuerySchema,
  analyticsTimelineQuerySchema,
} from '../schemas/analytics.schema.js';
import { widgetSchemaBodySchema } from '../schemas/widget-schema.schema.js';
import {
  exportSubmissionsBodySchema,
  listSubmissionsQuerySchema,
  submissionParamsSchema,
} from '../schemas/submission.schema.js';
import { widgetVersionParamsSchema } from '../schemas/widget-version.schema.js';
import {
  createWidgetBodySchema,
  listWidgetsQuerySchema,
  updateWidgetBodySchema,
  widgetIdParamsSchema,
} from '../schemas/widget.schema.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get(
  '/',
  requireRole('VIEWER'),
  validateRequest({ query: listWidgetsQuerySchema }),
  widgetController.listWidgets,
);

router.post(
  '/',
  requireRole('EDITOR'),
  validateRequest({ body: createWidgetBodySchema }),
  widgetController.createWidget,
);

router.get(
  '/:id/schema',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetSchemaController.getSchema,
);

router.put(
  '/:id/schema',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, body: widgetSchemaBodySchema }),
  widgetSchemaController.updateSchema,
);

router.post(
  '/:id/schema/reset',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetSchemaController.resetSchema,
);

router.post(
  '/:id/schema/validate',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, body: widgetSchemaBodySchema }),
  widgetSchemaController.validateSchema,
);

router.post(
  '/:id/publish',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetVersionController.publishWidget,
);

router.post(
  '/:id/unpublish',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetVersionController.unpublishWidget,
);

router.get(
  '/:id/versions',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetVersionController.listVersions,
);

router.get(
  '/:id/versions/:versionId',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetVersionParamsSchema }),
  widgetVersionController.getVersion,
);

router.post(
  '/:id/versions/:versionId/restore',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetVersionParamsSchema }),
  widgetVersionController.restoreVersion,
);

router.get(
  '/:id/submissions',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, query: listSubmissionsQuerySchema }),
  submissionController.listSubmissions,
);

router.post(
  '/:id/submissions/export',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, body: exportSubmissionsBodySchema }),
  submissionController.exportSubmissions,
);

router.get(
  '/:id/submissions/:submissionId',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: submissionParamsSchema }),
  submissionController.getSubmission,
);

router.delete(
  '/:id/submissions/:submissionId',
  requireRole('ADMIN'),
  requireOwnership(),
  validateRequest({ params: submissionParamsSchema }),
  submissionController.deleteSubmission,
);

router.get(
  '/:id/analytics',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, query: analyticsQuerySchema }),
  analyticsController.getOverview,
);

router.get(
  '/:id/analytics/timeline',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, query: analyticsTimelineQuerySchema }),
  analyticsController.getTimeline,
);

router.get(
  '/:id/analytics/devices',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, query: analyticsQuerySchema }),
  analyticsController.getDevices,
);

router.get(
  '/:id/analytics/countries',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, query: analyticsQuerySchema }),
  analyticsController.getCountries,
);

router.get(
  '/:id/analytics/sources',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, query: analyticsQuerySchema }),
  analyticsController.getSources,
);

router.get(
  '/:id/analytics/performance',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, query: analyticsQuerySchema }),
  analyticsController.getPerformance,
);

router.get(
  '/:id',
  requireRole('VIEWER'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.getWidget,
);

router.patch(
  '/:id',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema, body: updateWidgetBodySchema }),
  widgetController.updateWidget,
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.deleteWidget,
);

router.post(
  '/:id/archive',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.archiveWidget,
);

router.post(
  '/:id/restore',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.restoreWidget,
);

router.post(
  '/:id/duplicate',
  requireRole('EDITOR'),
  requireOwnership(),
  validateRequest({ params: widgetIdParamsSchema }),
  widgetController.duplicateWidget,
);

export { router as widgetRouter };
