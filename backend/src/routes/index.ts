import { Router } from 'express';

import { healthRouter } from './health.routes.js';
import { widgetRouter } from './widget.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/api/v1/widgets', widgetRouter);

export { router as apiRouter };
