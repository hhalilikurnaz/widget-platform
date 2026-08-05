import { Router } from 'express';

import { healthRouter } from './health.routes.js';
import { publicRouter } from './public.routes.js';
import { widgetRouter } from './widget.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/public', publicRouter);
router.use('/api/v1/widgets', widgetRouter);

export { router as apiRouter };
